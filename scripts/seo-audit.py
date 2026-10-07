"""Audit the production-mode public site using raw HTML, never hydration.

Usage: python scripts/seo-audit.py http://localhost:23330 reports/seo/audit.json
"""
import concurrent.futures
import html.parser
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = sys.argv[1].rstrip("/")
OUTPUT = Path(sys.argv[2])
CANONICAL = "https://aiobservly.com"


class Page(html.parser.HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.title = ""
        self.in_title = False
        self.meta = {}
        self.canonical = None
        self.h1 = 0
        self.headings = []
        self.links = []
        self.ids = set()
        self.images = []
        self.schemas = []
        self.in_json = False
        self.json = ""
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1 += 1
        if tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            self.headings.append(int(tag[1]))
        if tag == "meta":
            self.meta[a.get("name") or a.get("property")] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag == "img":
            self.images.append(a)
        if tag == "script" and a.get("type") == "application/ld+json":
            self.in_json = True
            self.json = ""

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_json:
            try:
                self.schemas.append(json.loads(self.json))
            except json.JSONDecodeError:
                self.schemas.append({"invalid": True})
            self.in_json = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_json:
            self.json += data


def fetch(path):
    request = urllib.request.Request(BASE + path, headers={"User-Agent": "AI-Observly-SEO-Audit/1.0", "Accept": "text/html"})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return response.status, dict(response.headers), response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers), error.read().decode("utf-8", "replace")


status, headers, sitemap = fetch("/sitemap.xml")
paths = [urllib.parse.urlparse(node.text).path for node in ET.fromstring(sitemap).iter() if node.tag.endswith("}loc")]
pages = {}
for path in paths:
    code, headers, body = fetch(path)
    p = Page(body)
    expected = (CANONICAL + path).rstrip("/")
    headers = {key.lower(): value for key, value in headers.items()}
    checks = {
        "http_200": code == 200,
        "canonical": (p.canonical or "").rstrip("/") == expected,
        "title_under_60": 0 < len(p.title) < 60 and p.title.endswith(" | AI Observly"),
        "description_under_160": 0 < len(p.meta.get("description", "")) < 160,
        "one_h1_in_raw_html": p.h1 == 1,
        "logical_heading_levels": all(current <= previous + 1 for previous, current in zip([0] + p.headings, p.headings)),
        "indexable": "noindex" not in p.meta.get("robots", "") and "noindex" not in headers.get("x-robots-tag", ""),
        "open_graph": all(p.meta.get(k) for k in ["og:title", "og:description", "og:image", "og:url", "og:type"]),
        "twitter": all(p.meta.get(k) for k in ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]),
        "valid_jsonld": bool(p.schemas) and all(not s.get("invalid") for s in p.schemas),
        "image_alt_attributes": all("alt" in image for image in p.images),
        "reserved_image_sizes": all(image.get("width") and image.get("height") or "absolute" in image.get("style", "") for image in p.images),
        "no_mixed_content": not any(image.get("src", "").startswith("http:") for image in p.images),
    }
    if path.startswith("/blog/"):
        checks["blog_posting_schema"] = any(s.get("@type") == "BlogPosting" and s.get("author") and s.get("publisher") and s.get("datePublished") and s.get("dateModified") and s.get("image") for s in p.schemas)
        checks["pricing_and_feature_links"] = "/pricing" in p.links and any(link.startswith("/features/") for link in p.links)
    if path.startswith("/docs/"):
        checks["tech_article_schema"] = any(s.get("@type") == "TechArticle" and s.get("dateModified") and s.get("datePublished") for s in p.schemas)
    if path.startswith(("/blog/", "/docs/")) or path in ["/tools", "/spend-checkup", "/blind-spot-quiz", "/tools/plan-pricing-margin-calculator"]:
        checks["breadcrumb_schema"] = any(s.get("@type") == "BreadcrumbList" for s in p.schemas)
    if path.startswith("/features/") or path == "/":
        checks["software_application_schema"] = any(s.get("@type") == "SoftwareApplication" for s in p.schemas)
    if path in ["/spend-checkup", "/blind-spot-quiz", "/tools/plan-pricing-margin-calculator"]:
        checks["web_application_schema"] = any(s.get("@type") == "WebApplication" for s in p.schemas)
    pages[path] = {"status": code, "title": p.title, "description": p.meta.get("description"), "canonical": p.canonical,
                   "checks": checks, "schemas": [s.get("@type") for s in p.schemas], "links": p.links,
                   "heading_levels": p.headings, "ids": sorted(p.ids), "headers": headers}
    print(path, "PASS" if all(checks.values()) else "FAIL", [k for k, v in checks.items() if not v], flush=True)

internal_links = set()
for p in pages.values():
    for link in p["links"]:
        u = urllib.parse.urlparse(link)
        if (link.startswith("/") and not link.startswith("//")) or u.hostname in ["aiobservly.com", "www.aiobservly.com"]:
            if u.path:
                internal_links.add(u.path)
results = {}
unknown = internal_links - set(pages)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    for path, value in zip(sorted(unknown), pool.map(fetch, sorted(unknown))):
        results[path] = value[0]
broken = {path: code for path, code in results.items() if code >= 400}
private = {}
for path in ["/login", "/signup", "/dashboard", "/onboarding", "/settings", "/customers", "/features"]:
    code, headers, body = fetch(path)
    p = Page(body)
    headers = {key.lower(): value for key, value in headers.items()}
    private[path] = {"status": code, "noindex": "noindex" in p.meta.get("robots", "") and "noindex" in headers.get("x-robots-tag", "")}
code, headers, body = fetch("/this-page-does-not-exist-seo-test")
not_found = {"status_404": code == 404, "navigation": all(link in Page(body).links for link in ["/", "/blog", "/docs"])}
robots = fetch("/robots.txt")[2]
report = {"base": BASE, "canonical_origin": CANONICAL, "pages": pages, "sitemap_page_count": len(paths),
          "private_routes": private, "404": not_found, "broken_internal_links": broken,
          "robots": robots, "unique_titles": len(set(p["title"] for p in pages.values())) == len(pages)}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(report, indent=2))
print("TOTAL", len(pages), "PAGES;", len(broken), "BROKEN LINKS")
