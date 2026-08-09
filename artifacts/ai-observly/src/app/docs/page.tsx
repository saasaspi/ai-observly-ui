"use client";
import { PublicLayout } from "@/components/public-layout";
import { DocsContent } from "@/components/docs-content";

export default function Docs() {
  // Always render as a standalone public page, regardless of auth state.
  // Dashboard visitors reach the same content via /dashboard/docs instead.
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <DocsContent />
      </div>
    </PublicLayout>
  );
}
