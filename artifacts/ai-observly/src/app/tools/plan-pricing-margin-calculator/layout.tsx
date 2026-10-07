import { pageMetadata } from "@/lib/seo";
import { PublicPageSeo } from "@/components/seo";
export const metadata = pageMetadata("/tools/plan-pricing-margin-calculator");
export default function Layout({ children }: { children: React.ReactNode }) { return <><PublicPageSeo path="/tools/plan-pricing-margin-calculator" />{children}</>; }
