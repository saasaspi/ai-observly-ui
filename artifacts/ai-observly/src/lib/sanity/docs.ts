import { client } from "./client";
import type { PortableTextProps } from "@portabletext/react";

type PortableTextValue = Extract<PortableTextProps["value"], unknown[]>;

export interface DocCategory {
  _id: string;
  title: string;
  slug: string;
  order: number;
  docs: DocLink[];
}

export interface DocLink {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  order: number;
}

export interface DocReference {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
}

export interface DocDetail {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: PortableTextValue;
  order: number;
  category?: {
    _id: string;
    title: string;
    slug: string;
  };
  relatedDocs?: DocReference[];
}

export const docsNavQuery = `*[_type == "docCategory"] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  order,
  "docs": *[_type == "docPage" && category._ref == ^._id] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    order
  }
}`;

export const uncategorizedDocsQuery = `*[_type == "docPage" && !defined(category)] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  order
}`;

export const docBySlugQuery = `*[_type == "docPage" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  body,
  order,
  category->{
    _id,
    title,
    "slug": slug.current
  },
  relatedDocs[]->{
    _id,
    title,
    "slug": slug.current,
    excerpt
  }
}`;

export const allDocsQuery = `*[_type == "docPage"] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  order,
  category->{
    _id,
    title,
    "slug": slug.current
  }
}`;

export async function getDocsNav(): Promise<{ categories: DocCategory[], uncategorized: DocLink[] }> {
  try {
    const [categories, uncategorized] = await Promise.all([
      client.fetch(docsNavQuery, {}, { next: { revalidate: 60 } }),
      client.fetch(uncategorizedDocsQuery, {}, { next: { revalidate: 60 } })
    ]);
    return { categories: categories || [], uncategorized: uncategorized || [] };
  } catch (error) {
    console.error("Error fetching docs nav:", error);
    return { categories: [], uncategorized: [] };
  }
}

export async function getDocBySlug(slug: string): Promise<DocDetail | null> {
  try {
    return await client.fetch(docBySlugQuery, { slug }, { next: { revalidate: 60 } });
  } catch (error) {
    console.error("Error fetching doc by slug:", error);
    return null;
  }
}

export async function getAllDocs(): Promise<DocDetail[]> {
  try {
    return await client.fetch(allDocsQuery, {}, { next: { revalidate: 60 } });
  } catch (error) {
    console.error("Error fetching all docs:", error);
    return [];
  }
}
