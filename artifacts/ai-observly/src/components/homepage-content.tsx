"use client";
import { createContext, useContext } from "react";
import type { PostSummary } from "@/lib/sanity/queries";
const HomepagePostsContext = createContext<PostSummary[]>([]);
const PostProvider = HomepagePostsContext.Provider as unknown as (props: { value: PostSummary[]; children: React.ReactNode }) => JSX.Element;
export function HomepageContentProvider({ posts, children }: { posts: PostSummary[]; children: React.ReactNode }) {
  return <PostProvider value={posts}>{children}</PostProvider>;
}
export function useHomepagePosts() { return useContext(HomepagePostsContext); }
