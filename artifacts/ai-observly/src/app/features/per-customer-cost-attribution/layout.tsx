import { pageMetadata } from "@/lib/seo";
import { PublicPageSeo } from "@/components/seo";
export const metadata = pageMetadata("/features/per-customer-cost-attribution");
export default function Layout({ children }: { children: React.ReactNode }) { return <><PublicPageSeo path="/features/per-customer-cost-attribution" />{children}</>; }
