"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { DocCategory, DocLink } from "@/lib/sanity/docs";
import { cn } from "@/lib/utils";

interface DocsSidebarProps {
  categories: DocCategory[];
  uncategorized: DocLink[];
  onNavigate?: () => void;
}

export function DocsSidebar({ categories, uncategorized, onNavigate }: DocsSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.toLowerCase().trim();

  const filteredCategories = categories.map(cat => {
    const categoryMatches = cat.title.toLowerCase().includes(normalizedQuery);
    const matchingDocs = categoryMatches
      ? cat.docs
      : cat.docs?.filter(doc => doc.title.toLowerCase().includes(normalizedQuery)) || [];
    
    return {
      ...cat,
      docs: matchingDocs,
      matches: categoryMatches || matchingDocs.length > 0
    };
  }).filter(cat => cat.matches);

  const filteredUncategorized = uncategorized?.filter(doc => 
    doc.title.toLowerCase().includes(normalizedQuery)
  ) || [];

  const hasResults = filteredCategories.length > 0 || filteredUncategorized.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="search"
          placeholder="Search docs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-muted/50 border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      <nav className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
        {!hasResults && normalizedQuery && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No results found for "{searchQuery}"
          </div>
        )}
        {!hasResults && !normalizedQuery && (
          <div className="text-sm text-muted-foreground text-center py-4">
            Published guides will appear here.
          </div>
        )}

        {filteredCategories.map((category) => (
          <div key={category._id} className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground tracking-tight px-2">
              {category.title}
            </h3>
            {category.docs?.length > 0 ? (
              <ul className="space-y-1">
                {category.docs.map((doc) => {
                  const href = `/docs/${doc.slug}`;
                  const isActive = pathname === href;
                  return (
                    <li key={doc._id}>
                      <Link
                        href={href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground px-2">No documents</p>
            )}
          </div>
        ))}

        {filteredUncategorized.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground tracking-tight px-2">
              Overview
            </h3>
            <ul className="space-y-1">
              {filteredUncategorized.map((doc) => {
                const href = `/docs/${doc.slug}`;
                const isActive = pathname === href;
                return (
                  <li key={doc._id}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {doc.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
}
