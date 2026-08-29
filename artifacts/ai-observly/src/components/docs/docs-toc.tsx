"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function DocsToc() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Wait a short moment for PortableText to render
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll("#docs-content h2, #docs-content h3"));
      
      const newItems = elements.map(el => ({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName.toLowerCase() === "h2" ? 2 : 3
      })).filter(item => item.id);
      
      setItems(newItems);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "0px 0px -80% 0px"
      }
    );

    const elements = document.querySelectorAll("#docs-content h2, #docs-content h3");
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-foreground tracking-tight">On this page</h3>
      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "text-sm transition-colors hover:text-foreground inline-block truncate",
              item.level === 3 ? "pl-4" : "",
              activeId === item.id ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
