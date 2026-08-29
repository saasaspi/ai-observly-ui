import { useEffect, useState } from 'react'
import { set, StringInputProps, unset } from 'sanity'

export function DeferredStringInput({
  value,
  onChange,
  elementProps,
  readOnly,
  schemaType,
}: StringInputProps) {
  const [draft, setDraft] = useState(value ?? '')
  const [hasSavedValue, setHasSavedValue] = useState(value ?? '')
  const fieldLabel = schemaType.title ?? schemaType.name
  const hasChanges = draft !== hasSavedValue

  useEffect(() => {
    const nextValue = value ?? ''
    setDraft(nextValue)
    setHasSavedValue(nextValue)
  }, [value])

  const saveValue = () => {
    if (!draft.trim()) {
      onChange(unset())
    } else {
      onChange(set(draft))
    }
    setHasSavedValue(draft)
  }

  return (
    <div>
      <input
        {...elementProps}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        aria-label={fieldLabel}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={saveValue}
          disabled={readOnly || !hasChanges}
          style={{
            border: 0,
            borderRadius: '0.25rem',
            background: hasChanges ? 'var(--brand-primary-color)' : 'var(--card-muted-bg-color)',
            color: hasChanges ? 'var(--card-bg-color)' : 'var(--card-muted-fg-color)',
            cursor: readOnly || !hasChanges ? 'default' : 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.45rem 0.7rem',
          }}
        >
          Save {fieldLabel.toLowerCase()}
        </button>
      </div>
    </div>
  )
}