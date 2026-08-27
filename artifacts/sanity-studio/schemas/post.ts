import { defineType, defineField } from 'sanity'
import { DeferredAltTextInput } from '../components/deferred-alt-text-input'

export const postSchema = defineType({
  name: 'post',
  title: 'Post',
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
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'table' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'text',
              description: 'Describe the image for screen readers and accessibility.',
              validation: (Rule) => Rule.max(160),
              components: {
                input: DeferredAltTextInput,
              },
            }),
          ],
        },
      ],
    }),

    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',
      options: {
        list: [
          { title: 'Cost & Margin Management', value: 'Cost & Margin Management' },
          { title: 'Unit Economics', value: 'Unit Economics' },
          { title: 'Comparisons', value: 'Comparisons' },
          { title: 'Data Reports', value: 'Data Reports' },
        ],
      },
    }),

    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: "Used for the page's <title> meta tag. Defaults to the post title if left blank.",
    }),

    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Used for the meta description tag. Keep under 160 characters.',
      validation: (Rule) => Rule.max(160),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      topic: 'topic',
      media: 'coverImage',
    },
    prepare({ title, topic, media }) {
      return {
        title,
        subtitle: topic ?? 'No topic',
        media,
      }
    },
  },
})
