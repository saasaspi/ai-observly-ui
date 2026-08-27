import { useEffect, useState } from 'react'
import { set, StringInputProps, unset } from 'sanity'

export function DeferredAltTextInput({
  value,
  onChange,
  elementProps,
  readOnly,
}: StringInputProps) {
  const [draft, setDraft] = useState(value ?? '')
  const [hasSavedValue, setHasSavedValue] = useState(value ?? '')

  useEffect(() => {
    const nextValue = value ?? ''
    setDraft(nextValue)
    setHasSavedValue(nextValue)
  }, [value])

  const hasChanges = draft !== hasSavedValue

  const saveAltText = () => {
    if (!draft.trim()) {
      onChange(unset())
    } else {
      onChange(set(draft))
    }
    setHasSavedValue(draft)
  }

  return (
    <div>
      <textarea
        {...elementProps}
        value={draft}
        rows={3}
        placeholder="Describe the image"
        onChange={(event) => setDraft(event.currentTarget.value)}
        aria-label="Alt text"
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginTop: '0.5rem',
        }}
      >
        <span style={{ color: 'var(--card-muted-fg-color)', fontSize: '0.75rem' }}>
          Changes are saved when you click the button.
        </span>
        <button
          type="button"
          onClick={saveAltText}
          disabled={readOnly || !hasChanges}
          style={{
            flexShrink: 0,
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
          Save alt text
        </button>
      </div>
    </div>
  )
}