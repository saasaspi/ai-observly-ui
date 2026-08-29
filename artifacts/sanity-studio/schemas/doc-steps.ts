import { defineArrayMember, defineField, defineType } from 'sanity'
import { BodyPortableTextInput } from '../components/body-portable-text-input'
import { DocStepTitleInput } from '../components/doc-step-title-input'
import { docsPortableTextMembers } from './doc-rich-text'

export const docStepSchema = defineType({
  name: 'docStep',
  title: 'Step',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Step title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      components: {
        input: DocStepTitleInput,
      },
    }),
    defineField({
      name: 'content',
      title: 'Description / content',
      type: 'array',
      description: 'Add text, inline code, code blocks, or images for this step.',
      options: {
        treeEditing: false,
        modal: {
          type: 'dialog',
          width: 2,
        },
      },
      components: {
        input: BodyPortableTextInput,
      },
      of: docsPortableTextMembers,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'stepNumber',
      title: 'Step number',
      type: 'number',
      description: 'Optional. Leave blank to use this step’s position in the list.',
      validation: (Rule) => Rule.integer().positive(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      stepNumber: 'stepNumber',
    },
    prepare({ title, stepNumber }) {
      return {
        title: title || 'Untitled step',
        subtitle: stepNumber ? `Step ${stepNumber}` : 'Step number follows list order',
      }
    },
  },
})

export const docStepsSchema = defineType({
  name: 'docSteps',
  title: 'Steps',
  type: 'object',
  fields: [
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      options: {
        treeEditing: false,
        modal: {
          type: 'dialog',
          width: 2,
        },
      },
      of: [
        defineArrayMember({
          type: 'docStep',
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      steps: 'steps',
    },
    prepare({ steps }) {
      return {
        title: 'Steps',
        subtitle: `${steps?.length ?? 0} step${steps?.length === 1 ? '' : 's'}`,
      }
    },
  },
})