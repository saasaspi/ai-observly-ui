import NextLink from "next/link";

// Public marketing links retain client-side navigation without downloading
// dashboard/auth route bundles before the visitor chooses to open them.
export default function PublicLink(props: Parameters<typeof NextLink>[0]) {
  return <NextLink {...props} prefetch={false} />;
}
