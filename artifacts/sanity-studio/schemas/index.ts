import { postSchema } from './post'
import { tableSchema, tableRowSchema } from './table'
import { docCategorySchema } from './doc-category'
import { docPageSchema } from './doc-page'
import { docCodeBlockSchema, docCodeVariantSchema } from './doc-code-block'
import { docInlineImageSchema } from './doc-inline-image'
import { docStepSchema, docStepsSchema } from './doc-steps'

export const schemas = [
  postSchema,
  tableRowSchema,
  tableSchema,
  docCategorySchema,
  docPageSchema,
  docCodeVariantSchema,
  docCodeBlockSchema,
  docStepSchema,
  docStepsSchema,
  docInlineImageSchema,
]
