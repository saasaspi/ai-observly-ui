"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocCategory, DocLink } from "@/lib/sanity/docs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// The project currently resolves two React type versions. These local aliases
// preserve the existing runtime-safe Radix primitives without spreading that
// unrelated type conflict into the new docs files.
const MobileSheet = Sheet as any;
const MobileSheetTrigger = SheetTrigger as any;
const MobileSheetContent = SheetContent as any;
const MobileSheetHeader = SheetHeader as any;
const MobileSheetTitle = SheetTitle as any;
const MobileSheetDescription = SheetDescription as any;

interface DocsLayoutClientProps {
  children: any;
  navData: {
    categories: DocCategory[];
    uncategorized: DocLink[];
  };
}

export function DocsLayoutClient({ children, navData }: DocsLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row">
      {/* Mobile Header / Nav Toggle */}
      <div className="md:hidden flex items-center justify-between py-4 border-b border-border sticky top-16 z-40 bg-background/95 backdrop-blur-md">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Documentation</h2>
        <MobileSheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <MobileSheetTrigger asChild>
            <button
              className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              aria-label="Open docs navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </MobileSheetTrigger>
          <MobileSheetContent side="left" className="w-4/5 max-w-sm p-0 flex flex-col z-[60]">
            <MobileSheetHeader className="p-4 border-b border-border text-left">
              <MobileSheetTitle>Documentation</MobileSheetTitle>
              <MobileSheetDescription className="sr-only">
                Search and browse AI Observly documentation.
              </MobileSheetDescription>
            </MobileSheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <DocsSidebar
                categories={navData.categories}
                uncategorized={navData.uncategorized}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </MobileSheetContent>
        </MobileSheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-border py-8 pr-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <DocsSidebar categories={navData.categories} uncategorized={navData.uncategorized} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 md:px-8">
        {children}
      </div>
    </div>
  );
}
