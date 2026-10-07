import { pageMetadata } from "@/lib/seo";
import { PublicPageSeo } from "@/components/seo";
export const metadata = pageMetadata("/features/per-feature-margins-roi");
export default function Layout({ children }: { children: React.ReactNode }) { return <><PublicPageSeo path="/features/per-feature-margins-roi" />{children}</>; }
