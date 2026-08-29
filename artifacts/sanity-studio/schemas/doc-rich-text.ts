import { defineArrayMember, defineField } from 'sanity'

export const docsPortableTextMembers = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'Heading 2', value: 'h2' },
      { title: 'Heading 3', value: 'h3' },
      { title: 'Heading 4', value: 'h4' },
      { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
      { title: 'Bullet', value: 'bullet' },
      { title: 'Numbered', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Strong', value: 'strong' },
        { title: 'Emphasis', value: 'em' },
        { title: 'Code', value: 'code' },
      ],
    },
  }),
  defineArrayMember({
    type: 'docCodeBlock',
  }),
  defineArrayMember({
    type: 'docInlineImage',
  }),
  // Keep previously pasted/uploaded Docs images valid while authors add alt text.
  // New clipboard pastes use docInlineImage above.
  defineArrayMember({
    type: 'image',
    title: 'Legacy Documentation Image',
    options: {
      hotspot: true,
    },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'text',
        rows: 2,
        description: 'Describe what this image communicates for screen readers.',
        validation: (Rule) => Rule.required().max(160),
      }),
    ],
  }),
  defineArrayMember({
    type: 'table',
  }),
]

export const docsBodyMembers = [
  ...docsPortableTextMembers,
  defineArrayMember({
    type: 'docSteps',
  }),
]