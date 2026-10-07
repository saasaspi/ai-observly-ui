"""Create a self-contained, shareable technical SEO audit report."""
import html
import json
from pathlib import Path

root = Path("reports/seo")
audit = json.loads((root / "audit.json").read_text())
before = json.loads((root / "lighthouse-before.json").read_text())
after = json.loads((root / "lighthouse-after.json").read_text())
escape = html.escape

def row(label, status, detail):
    return f'<tr><th>{escape(label)}</th><td class="{status.lower()}">{status}</td><td>{escape(detail)}</td></tr>'

failures = [(path, check) for path, data in audit["pages"].items() for check, passed in data["checks"].items() if not passed]
checks = [
    row("Public page crawl", "PASS" if not failures else "FAIL", f'{audit["sitemap_page_count"]} public pages checked using raw HTML; {len(failures)} failed checks.'),
    row("Robots rules", "PASS", "Public pages allowed; private routes blocked; six requested crawler identities explicitly covered."),
    row("Dynamic sitemap", "PASS", "19 marketing/index/tool pages, 13 blog articles and 5 docs. Sanity timestamps; public-content release date for static pages. Revalidates every 60 seconds."),
    row("Canonicals", "PASS", "Self-referencing https://aiobservly.com canonicals on all public pages, including search/filter variants."),
    row("Private noindex", "PASS" if all(v["noindex"] for v in audit["private_routes"].values()) else "FAIL", "Both metadata and response headers checked on auth, dashboard, onboarding, settings, customers and internal features."),
    row("Path redirects", "PASS", "301 redirects for uppercase/trailing-slash paths and legacy feature/setup aliases. Canonical paths have no trailing slash except the origin."),
    row("Host redirects", "PENDING", "Intentionally gated: the live apex currently redirects to www on Vercel. Reverse this hosting redirect and verify OAuth settings before enabling the app's public-route host redirects."),
    row("404 response", "PASS" if all(audit["404"].values()) else "FAIL", "Real HTTP 404 with links to Home, Blog and Docs."),
    row("Metadata", "PASS" if not failures else "FAIL", "Unique titles under 60 characters, descriptions under 160, OG and Twitter metadata checked on all sitemap pages."),
    row("Structured data", "PASS" if not failures else "FAIL", "JSON syntax, requested schema types, dates and author/publisher fields checked in raw HTML. This is not Google's Rich Results validation."),
    row("Heading hierarchy", "PASS" if not failures else "FAIL", "One H1 per page; no skipped heading levels in public-page HTML."),
    row("Internal links", "PASS" if not audit["broken_internal_links"] else "FAIL", f'{len(audit["broken_internal_links"])} broken internal links found; legacy CMS links resolve through 301 aliases.'),
    row("Performance ≥90", "PASS" if after["categories"]["performance"]["score"] >= .90 else "FAIL", "Mobile Lighthouse on a local Next.js production build; not a claim about the deployed custom domain."),
    row("LCP <2.5 seconds", "PASS" if after["audits"]["largest-contentful-paint"]["numericValue"] < 2500 else "FAIL", after["audits"]["largest-contentful-paint"]["displayValue"]),
    row("CLS <0.1", "PASS" if after["audits"]["cumulative-layout-shift"]["numericValue"] < .1 else "FAIL", after["audits"]["cumulative-layout-shift"]["displayValue"]),
    row("INP <200ms", "UNVERIFIED", "Lighthouse's navigation audit does not establish field INP. Confirm with production real-user measurements after publishing."),
    row("HTTPS and security headers", "PASS", "HTTPS enforcement on production hosts; HSTS, nosniff, strict-origin referrer policy, and SAMEORIGIN on deployed hosts. Development remains embeddable."),
]
scores = "".join(
    f'<tr><th>{escape(before["categories"][key]["title"])}</th><td>{round(before["categories"][key]["score"]*100)}</td><td>{round(after["categories"][key]["score"]*100)}</td></tr>'
    for key in ["performance", "accessibility", "best-practices", "seo"]
)
metrics = "".join(f'<tr><th>{escape(label)}</th><td>{escape(before["audits"][key]["displayValue"])}</td><td>{escape(after["audits"][key]["displayValue"])}</td></tr>'
                  for key, label in [("largest-contentful-paint", "LCP"), ("cumulative-layout-shift", "CLS"), ("total-blocking-time", "Total blocking time (lab metric, not INP)")])
pages = "".join(f'<tr><td>{escape(path)}</td><td>{escape(data["title"])}</td><td>{"PASS" if all(data["checks"].values()) else "FAIL"}</td></tr>' for path, data in audit["pages"].items())
report = f"""<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI Observly technical SEO audit</title><style>
body{{font:16px/1.6 system-ui,sans-serif;color:#172033;background:#f5f7fb;margin:0;padding:24px}}
main{{max-width:1100px;margin:auto;background:white;padding:32px;border-radius:16px}}
h1{{font-size:32px}}h2{{margin-top:36px}}table{{width:100%;border-collapse:collapse;font-size:14px}}
th,td{{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #dde4ef}}th{{font-weight:600}}
.pass{{color:#14733c}}.fail{{color:#b42318}}.pending,.unverified{{color:#8f5b00}}.note{{padding:18px;background:#edf3ff;border-radius:10px}}
.table{{overflow-x:auto}}@media(max-width:600px){{body{{padding:8px}}main{{padding:16px}}th,td{{padding:8px}}}}
</style><main><h1>AI Observly technical SEO audit</h1>
<p>Completed code and raw-HTML checks, 7 October 2026. Canonical origin: https://aiobservly.com.</p>
<div class="note"><strong>Scope of the measurements:</strong> Before and after Lighthouse audits use the same local Next.js production-mode server, default mobile simulated throttling and Lighthouse version. Results vary between runs and are not production field data. The custom-domain hosting still needs reconciliation before these changes are live there.</div>
<h2>Pass/fail checklist</h2><div class="table"><table><thead><tr><th>Check</th><th>Status</th><th>Result</th></tr></thead><tbody>{''.join(checks)}</tbody></table></div>
<h2>Mobile Lighthouse scores</h2><table><thead><tr><th>Category</th><th>Before</th><th>After</th></tr></thead><tbody>{scores}{metrics}</tbody></table>
<h2>Changes implemented</h2><ul>
<li>Central public-page metadata, unique branded social-image fallback routes, native canonical/robots metadata, and favicon/manifest assets.</li>
<li>Server-rendered homepage blog previews, cached Sanity content and complete sitemap coverage.</li>
<li>Organization, WebSite, SoftwareApplication, WebApplication, BlogPosting, TechArticle, breadcrumbs and actual FAQ schemas.</li>
<li>Next.js image sizing, descriptive alt fallbacks, self-hosted Next.js fonts, modern image formats and reduced-motion support.</li>
<li>Deferred analytics bundles and queued GA events, stable illustration labels, no initial content hiding, leaner image URL generation and reduced speculative route downloads.</li>
<li>Relevant feature/article/pricing links, fixed historical links, semantic headings, mobile tap-target sizing, HTTPS and security headers.</li></ul>
<h2>Remaining code-level performance gap</h2>
<p>The 90+ mobile performance and sub-2.5-second LCP targets are not yet met. The homepage still hydrates a large client-rendered component tree. Fonts and script scheduling were optimized, illustration repainting was removed, unnecessary route prefetching was reduced, and the Sanity API client was removed from the image-builder browser bundle. These improved the score, but further separation of static server content from interactive client components is needed. Deferred analytics start on the first pointer/keyboard interaction or after eight seconds; signup/custom-event callers can still initialize immediately.</p>
<p>The production build succeeds. The repository-wide type check still reports pre-existing React type-version conflicts; the new SEO modules were checked and do not add errors to that filtered set.</p>
<h2>Actions outside the codebase</h2><ol>
<li>Determine whether Vercel or Replit should serve the custom domain, then publish this code to that hosting target. Replit publication alone is not verified to update the Vercel-served domains.</li>
<li>Remove the hosting redirect from aiobservly.com to www.aiobservly.com and configure the opposite direction. Only then enable the prepared canonical host redirect, after checking Google OAuth origins and any external webhook/callback registrations. Auth/API paths are deliberately preserved.</li>
<li>After publication, submit https://aiobservly.com/sitemap.xml in Google Search Console and Bing Webmaster Tools, validate representative rich results, and request recrawling of important pages.</li>
<li>Measure production INP and Core Web Vitals with real-user data. A lab blocking-time result is not an INP result.</li></ol>
<h2>Public-page audit</h2><div class="table"><table><thead><tr><th>Path</th><th>Title</th><th>Status</th></tr></thead><tbody>{pages}</tbody></table></div>
<p>Machine-readable results and complete Lighthouse reports accompany this summary.</p></main></html>"""
(root / "technical-seo-report.html").write_text(report)
print(root / "technical-seo-report.html")
