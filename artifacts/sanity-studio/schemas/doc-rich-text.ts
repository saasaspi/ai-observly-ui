import { defineArrayMember } from 'sanity'

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
  defineArrayMember({
    type: 'image',
    options: {
      hotspot: true,
    },
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