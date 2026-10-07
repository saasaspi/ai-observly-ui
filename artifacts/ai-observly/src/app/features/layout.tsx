import { PRIVATE_METADATA } from "@/lib/seo";
// Only the internal index and dynamic feature-detail pages are private.
// Public feature children override this with their own indexable metadata.
export const metadata = PRIVATE_METADATA;
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
