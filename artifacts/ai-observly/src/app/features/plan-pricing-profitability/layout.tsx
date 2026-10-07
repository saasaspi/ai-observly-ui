import { pageMetadata } from "@/lib/seo";
import { PublicPageSeo } from "@/components/seo";
export const metadata = pageMetadata("/features/plan-pricing-profitability");
export default function Layout({ children }: { children: React.ReactNode }) { return <><PublicPageSeo path="/features/plan-pricing-profitability" />{children}</>; }
