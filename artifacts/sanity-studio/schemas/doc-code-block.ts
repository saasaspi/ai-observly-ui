import { defineArrayMember, defineField, defineType } from 'sanity'

export const docCodeVariantSchema = defineType({
  name: 'docCodeVariant',
  title: 'Code Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'tabLabel',
      title: 'Tab label',
      type: 'string',
      description: 'Optional. Leave blank when this code block has only one variant.',
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      description: 'Use a language name such as bash, powershell, cmd, javascript, typescript, json, yaml, xml, or python.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Code',
      type: 'text',
      rows: 12,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'filename',
      title: 'Filename caption',
      type: 'string',
      description: 'Optional caption shown below the code block, such as browserstack.yml.',
    }),
  ],
  preview: {
    select: {
      title: 'tabLabel',
      language: 'language',
      filename: 'filename',
    },
    prepare({ title, language, filename }) {
      return {
        title: title || filename || 'Code variant',
        subtitle: language || 'Language not set',
      }
    },
  },
})

export const docCodeBlockSchema = defineType({
  name: 'docCodeBlock',
  title: 'Annotated Code Block',
  type: 'object',
  fields: [
    defineField({
      name: 'variants',
      title: 'Code variants',
      type: 'array',
      description: 'Add one variant for a single code block, or multiple variants to show tabs.',
      options: {
        treeEditing: false,
        modal: {
          type: 'dialog',
          width: 2,
        },
      },
      of: [
        defineArrayMember({
          type: 'docCodeVariant',
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      variants: 'variants',
    },
    prepare({ variants }) {
      const count = variants?.length ?? 0
      return {
        title: 'Annotated Code Block',
        subtitle: `${count} variant${count === 1 ? '' : 's'}`,
      }
    },
  },
})