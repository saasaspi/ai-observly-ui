import { useEffect, useState } from 'react'
import { set, StringInputProps, unset } from 'sanity'

export function DocStepTitleInput({
  value,
  onChange,
  elementProps,
  readOnly,
}: StringInputProps) {
  const [draft, setDraft] = useState(value ?? '')
  const [savedValue, setSavedValue] = useState(value ?? '')
  const hasChanges = draft !== savedValue

  useEffect(() => {
    const nextValue = value ?? ''
    setDraft(nextValue)
    setSavedValue(nextValue)
  }, [value])

  const saveTitle = () => {
    if (draft.trim()) onChange(set(draft.trim()))
    else onChange(unset())
    setSavedValue(draft)
  }

  return (
    <div>
      <input
        {...elementProps}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        aria-label="Step title"
      />
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '0.5rem',
          padding: '0.5rem 0',
          background: '#ffffff',
        }}
      >
        <button
          type="button"
          onClick={saveTitle}
          disabled={readOnly || !hasChanges || !draft.trim()}
          style={{
            minWidth: 126,
            border: '1px solid',
            borderColor: hasChanges && draft.trim() ? '#1d4ed8' : '#9ca3af',
            borderRadius: 5,
            background: hasChanges && draft.trim() ? '#1d4ed8' : '#e5e7eb',
            color: hasChanges && draft.trim() ? '#ffffff' : '#374151',
            cursor: readOnly || !hasChanges || !draft.trim() ? 'default' : 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 700,
            padding: '0.55rem 0.8rem',
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