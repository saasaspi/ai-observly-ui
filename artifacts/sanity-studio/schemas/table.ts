import { defineType, defineField } from 'sanity'
import { TableInput } from '../components/table-input'

/**
 * tableRow — a single row in a table, holding an array of plain-text cells.
 * Used as a child type inside the `table` object below.
 */
export const tableRowSchema = defineType({
  name: 'tableRow',
  title: 'Table Row',
  type: 'object',
  fields: [
    defineField({
      name: 'cells',
      title: 'Cells',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: { cells: 'cells' },
    prepare({ cells }: { cells?: string[] }) {
      return { title: (cells ?? []).join(' | ') || 'Empty row' }
    },
  },
})

/**
 * table — a block-level object embeddable in Portable Text body fields.
 * Appears in the Studio "Insert" menu as "Table".
 */
export const tableSchema = defineType({
  name: 'table',
  title: 'Table',
  type: 'object',
  initialValue: {
    rows: [
      { _type: 'tableRow', cells: ['', '', ''] },
      { _type: 'tableRow', cells: ['', '', ''] },
      { _type: 'tableRow', cells: ['', '', ''] },
    ],
  },
  components: {
    input: TableInput,
  },
  fields: [
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [{ type: 'tableRow' }],
    }),
  ],
  preview: {
    select: { rows: 'rows' },
    prepare({ rows }: { rows?: unknown[] }) {
      const count = (rows ?? []).length
      return { title: `Table (${count} row${count !== 1 ? 's' : ''})` }
    },
  },
})
