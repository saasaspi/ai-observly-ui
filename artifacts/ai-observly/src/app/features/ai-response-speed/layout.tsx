import { pageMetadata } from "@/lib/seo";
import { PublicPageSeo } from "@/components/seo";
export const metadata = pageMetadata("/features/ai-response-speed");
export default function Layout({ children }: { children: React.ReactNode }) { return <><PublicPageSeo path="/features/ai-response-speed" />{children}</>; }
