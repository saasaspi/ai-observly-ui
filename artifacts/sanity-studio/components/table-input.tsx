import { useEffect, useMemo, useState } from 'react'
import { set, type ObjectInputProps } from 'sanity'

type TableRow = {
  _key?: string
  _type?: 'tableRow'
  cells?: string[]
}

type TableValue = {
  _type?: 'table'
  rows?: TableRow[]
}

type TableInputProps = ObjectInputProps<TableValue>

function newKey() {
  return Math.random().toString(36).slice(2, 10)
}

function makeRows(rowCount: number, columnCount: number): TableRow[] {
  return Array.from({ length: rowCount }, () => ({
    _key: newKey(),
    _type: 'tableRow',
    cells: Array.from({ length: columnCount }, () => ''),
  }))
}

export function TableInput({ value, onChange }: TableInputProps) {
  const [rows, setRows] = useState<TableRow[]>(value?.rows ?? [])
  const columnCount = useMemo(
    () => (rows.length > 0 ? Math.max(1, ...rows.map((row) => row.cells?.length ?? 0)) : 3),
    [rows],
  )

  useEffect(() => {
    const nextRows = value?.rows ?? []
    setRows(nextRows)
  }, [value?.rows])

  const updateRows = (nextRows: TableRow[]) => {
    const normalizedRows = nextRows.map((row) => ({
      ...row,
      _key: row._key ?? newKey(),
      _type: 'tableRow' as const,
      cells: row.cells ?? [],
    }))
    setRows(normalizedRows)
    onChange(set(normalizedRows, ['rows']))
  }

  const updateCell = (rowIndex: number, columnIndex: number, text: string) => {
    const nextRows = rows.map((row, currentRowIndex) => {
      if (currentRowIndex !== rowIndex) return row
      const cells = Array.from({ length: columnCount }, (_, currentColumnIndex) =>
        currentColumnIndex === columnIndex ? text : row.cells?.[currentColumnIndex] ?? '',
      )
      return { ...row, cells }
    })
    updateRows(nextRows)
  }

  const addRow = () => {
    updateRows([...rows, { _key: newKey(), _type: 'tableRow', cells: Array(columnCount).fill('') }])
  }

  const addColumn = () => {
    if (rows.length === 0) {
      updateRows(makeRows(1, 1))
      return
    }
    updateRows(rows.map((row) => ({ ...row, cells: [...(row.cells ?? []), ''] })))
  }

  const removeRow = (rowIndex: number) => {
    updateRows(rows.filter((_, currentRowIndex) => currentRowIndex !== rowIndex))
  }

  const removeColumn = (columnIndex: number) => {
    if (columnCount <= 1) return
    updateRows(
      rows.map((row) => ({
        ...row,
        cells: (row.cells ?? []).filter((_, currentColumnIndex) => currentColumnIndex !== columnIndex),
      })),
    )
  }

  const startTable = () => updateRows(makeRows(3, 3))

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Table editor</div>
          <div style={{ color: '#6b7280', fontSize: 12, marginTop: 3 }}>
            Changes autosave as you type. The first row is displayed as the table header.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={addColumn} style={secondaryButtonStyle}>
            + Add column
          </button>
          <button type="button" onClick={addRow} style={primaryButtonStyle}>
            + Add row
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontWeight: 600, marginBottom: 5 }}>No rows yet</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 14 }}>
            Start with a 3 × 3 table, then add or remove rows and columns as needed.
          </div>
          <button type="button" onClick={startTable} style={primaryButtonStyle}>
            Create 3 × 3 table
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #dfe3e8', borderRadius: 6 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
            <thead>
              <tr>
                <th style={cornerCellStyle} aria-label="Row actions" />
                {Array.from({ length: columnCount }, (_, columnIndex) => (
                  <th key={columnIndex} style={columnHeaderStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span>Column {columnIndex + 1}</span>
                      <button
                        type="button"
                        title={`Remove column ${columnIndex + 1}`}
                        onClick={() => removeColumn(columnIndex)}
                        disabled={columnCount <= 1}
                        style={removeButtonStyle}
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row._key ?? rowIndex}>
                  <th style={rowHeaderStyle}>
                    <span>Row {rowIndex + 1}</span>
                    <button
                      type="button"
                      title={`Remove row ${rowIndex + 1}`}
                      onClick={() => removeRow(rowIndex)}
                      style={removeButtonStyle}
                    >
                      ×
                    </button>
                  </th>
                  {Array.from({ length: columnCount }, (_, columnIndex) => (
                    <td key={columnIndex} style={bodyCellStyle}>
                      <input
                        type="text"
                        value={row.cells?.[columnIndex] ?? ''}
                        onChange={(event) => updateCell(rowIndex, columnIndex, event.currentTarget.value)}
                        placeholder={rowIndex === 0 ? 'Header' : 'Cell text'}
                        style={inputStyle}
                        aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  border: '1px solid #2276d2',
  background: '#2276d2',
  color: '#fff',
  borderRadius: 5,
  padding: '7px 11px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  background: '#fff',
  color: '#2276d2',
}

const emptyStateStyle: React.CSSProperties = {
  border: '1px dashed #b8c0ca',
  borderRadius: 6,
  padding: '28px 20px',
  textAlign: 'center',
}

const cornerCellStyle: React.CSSProperties = {
  width: 86,
  padding: 8,
  background: '#f5f6f7',
  borderBottom: '1px solid #dfe3e8',
}

const columnHeaderStyle: React.CSSProperties = {
  minWidth: 145,
  padding: '7px 9px',
  background: '#f5f6f7',
  borderLeft: '1px solid #dfe3e8',
  borderBottom: '1px solid #dfe3e8',
  color: '#4b5563',
  fontSize: 11,
  fontWeight: 600,
  textAlign: 'left',
}

const rowHeaderStyle: React.CSSProperties = {
  padding: '7px 9px',
  background: '#f5f6f7',
  borderBottom: '1px solid #dfe3e8',
  color: '#4b5563',
  fontSize: 11,
  fontWeight: 600,
  textAlign: 'left',
  whiteSpace: 'nowrap',
}

const bodyCellStyle: React.CSSProperties = {
  padding: 5,
  borderLeft: '1px solid #dfe3e8',
  borderBottom: '1px solid #dfe3e8',
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  minWidth: 125,
  border: '1px solid #d7dce2',
  borderRadius: 4,
  padding: '7px 8px',
  color: '#1f2937',
  background: '#fff',
  fontSize: 13,
  outline: 'none',
}

const removeButtonStyle: React.CSSProperties = {
  border: 0,
  background: 'transparent',
  color: '#9ca3af',
  padding: 0,
  fontSize: 18,
  lineHeight: 1,
  cursor: 'pointer',
}