import { defineArrayMember, defineField, defineType } from 'sanity'
import { docsBodyMembers } from './doc-rich-text'

export const docPageSchema = defineType({
  name: 'docPage',
  title: 'Doc Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Enter only the page segment, such as getting-started.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'docCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first within this category.',
      initialValue: 0,
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'A short summary used in docs listings and link previews.',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Use Heading 2 and Heading 3 styles for sections shown in On this page.',
      options: {
        modal: {
          type: 'dialog',
          width: 2,
        },
      },
      of: docsBodyMembers,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'relatedDocs',
      title: 'Related Docs',
      type: 'array',
      description: 'Optional manually curated links shown below the previous/next pager.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'docPage' }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      order: 'order',
    },
    prepare({ title, category, order }) {
      return {
        title,
        subtitle: `${category ?? 'Uncategorized'} · Order: ${order ?? 0}`,
      }
    },
  },
})