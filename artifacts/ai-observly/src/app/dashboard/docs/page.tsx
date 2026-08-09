"use client";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { DocsContent } from "@/components/docs-content";

export default function DashboardDocs() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DocsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
