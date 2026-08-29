import { defineField, defineType } from 'sanity'
import { DeferredAltTextInput } from '../components/deferred-alt-text-input'

export const docInlineImageSchema = defineType({
  name: 'docInlineImage',
  title: 'Documentation Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alt text',
      type: 'text',
      rows: 2,
      description: 'Describe what this image communicates for screen readers.',
      components: {
        input: DeferredAltTextInput,
      },
      validation: (Rule) => Rule.required().max(160),
    }),
  ],
  preview: {
    select: {
      title: 'altText',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Documentation image',
        media,
      }
    },
  },
})