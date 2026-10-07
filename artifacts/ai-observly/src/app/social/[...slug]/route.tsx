import { ImageResponse } from "next/og";
import { PUBLIC_PAGES } from "@/lib/seo";
import { client } from "@/lib/sanity/client";
import { LAUNCH_POST } from "@/lib/new-features";

export const revalidate = 60;
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug[0] === "home" ? "/" : "/" + slug.join("/");
  let title = PUBLIC_PAGES[path]?.title;
  if (path === `/blog/${LAUNCH_POST.slug}`) title = LAUNCH_POST.title;
  if (!title && ["blog", "docs"].includes(slug[0])) {
    const type = slug[0] === "blog" ? "post" : "docPage";
    const data = await client.fetch(`*[_type == $type && (slug.current == $slug || slug.current == "/"+$slug)][0]{title}`, { type, slug: slug.slice(1).join("/") }, { next: { revalidate: 60 } });
    title = data?.title;
  }
  title ||= slug.slice(1).join(" ").replace(/-/g, " ") || "AI Cost & Margin Insights";
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "70px 80px", background: "#eff4ff", color: "#111827", justifyContent: "space-between" }}>
      <div style={{ display: "flex", fontSize: 30, color: "#1746c0", fontWeight: 700 }}>AI Observly</div>
      <div style={{ display: "flex", fontSize: 60, fontWeight: 700, lineHeight: 1.15 }}>{title.slice(0, 140)}</div>
      <div style={{ display: "flex", fontSize: 24, color: "#1746c0" }}>aiobservly.com · AI costs, clearly understood</div>
    </div>, { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, s-maxage=60" } },
  );
}
