import { defineField, defineType } from 'sanity'

export const docCategorySchema = defineType({
  name: 'docCategory',
  title: 'Doc Category',
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
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first in the docs navigation.',
      initialValue: 0,
      validation: (Rule) => Rule.required().integer(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order',
    },
    prepare({ title, order }) {
      return {
        title,
        subtitle: `Order: ${order ?? 0}`,
      }
    },
  },
})