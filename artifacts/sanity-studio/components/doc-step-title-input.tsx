import { useEffect, useState } from 'react'
import { set, type StringInputProps, unset } from 'sanity'

export function DocStepTitleInput({
  value,
  onChange,
  readOnly,
  elementProps,
}: StringInputProps) {
  const [draft, setDraft] = useState(value ?? '')
  const savedValue = value ?? ''
  const hasChanges = draft !== savedValue
  const canSave = !readOnly && hasChanges && Boolean(draft.trim())

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  const saveTitle = () => {
    const nextTitle = draft.trim()
    onChange(nextTitle ? set(nextTitle) : unset())
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <input
        {...elementProps}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        disabled={readOnly}
        placeholder="Enter the complete step title"
        style={{
          boxSizing: 'border-box',
          width: '100%',
          border: '1px solid #a8b1bd',
          borderRadius: 5,
          background: '#ffffff',
          color: '#1f2937',
          font: 'inherit',
          padding: '10px 12px',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          {hasChanges ? 'Title is not saved yet.' : 'Title is saved.'}
        </span>
        <button
          type="button"
          onClick={saveTitle}
          disabled={!canSave}
          style={{
            minWidth: 132,
            border: '1px solid',
            borderColor: canSave ? '#1d4ed8' : '#9ca3af',
            borderRadius: 5,
            background: canSave ? '#1d4ed8' : '#e5e7eb',
            color: canSave ? '#ffffff' : '#374151',
            cursor: canSave ? 'pointer' : 'default',
            fontSize: 13,
            fontWeight: 700,
            padding: '8px 12px',
            opacity: 1,
            visibility: 'visible',
          }}
        >
          Save step title
        </button>
      </div>
    </div>
  )
}