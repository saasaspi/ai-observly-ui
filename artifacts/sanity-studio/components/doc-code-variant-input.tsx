import { useEffect, useState } from 'react'
import { ObjectInputProps, set } from 'sanity'

type CodeVariantValue = {
  _type?: string
  _key?: string
  tabLabel?: string
  language?: string
  code?: string
  filename?: string
}

type DraftVariant = {
  tabLabel: string
  language: string
  code: string
  filename: string
}

const emptyDraft: DraftVariant = {
  tabLabel: '',
  language: '',
  code: '',
  filename: '',
}

function draftFromValue(value?: CodeVariantValue): DraftVariant {
  return {
    tabLabel: value?.tabLabel ?? '',
    language: value?.language ?? '',
    code: value?.code ?? '',
    filename: value?.filename ?? '',
  }
}

export function DocCodeVariantInput({
  value,
  onChange,
  readOnly,
}: ObjectInputProps<CodeVariantValue>) {
  const [draft, setDraft] = useState<DraftVariant>(() => draftFromValue(value))
  const [savedDraft, setSavedDraft] = useState<DraftVariant>(() => draftFromValue(value))

  useEffect(() => {
    const nextDraft = draftFromValue(value)
    setDraft(nextDraft)
    setSavedDraft(nextDraft)
  }, [value?.tabLabel, value?.language, value?.code, value?.filename])

  const hasChanges =
    draft.tabLabel !== savedDraft.tabLabel ||
    draft.language !== savedDraft.language ||
    draft.code !== savedDraft.code ||
    draft.filename !== savedDraft.filename
  const hasRequiredValues = Boolean(draft.language.trim() && draft.code.trim())

  const updateDraft = (field: keyof DraftVariant, nextValue: string) => {
    setDraft((current) => ({ ...current, [field]: nextValue }))
  }

  const saveVariant = () => {
    const nextValue: CodeVariantValue = {
      ...(value ?? {}),
      _type: 'docCodeVariant',
      language: draft.language.trim(),
      code: draft.code,
    }

    if (draft.tabLabel.trim()) nextValue.tabLabel = draft.tabLabel.trim()
    else delete nextValue.tabLabel

    if (draft.filename.trim()) nextValue.filename = draft.filename.trim()
    else delete nextValue.filename

    onChange(set(nextValue))
    setSavedDraft(draft)
  }

  const inputStyle = {
    boxSizing: 'border-box' as const,
    width: '100%',
    border: '1px solid var(--input-border-color)',
    borderRadius: '0.25rem',
    background: 'var(--input-bg-color)',
    color: 'var(--input-color)',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    padding: '0.6rem 0.7rem',
  }

  const labelStyle = {
    display: 'block',
    color: 'var(--card-fg-color)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    marginBottom: '0.35rem',
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <label>
        <span style={labelStyle}>Tab label</span>
        <input
          type="text"
          value={draft.tabLabel}
          onChange={(event) => updateDraft('tabLabel', event.currentTarget.value)}
          placeholder="For example, macOS or Linux"
          disabled={readOnly}
          style={inputStyle}
        />
        <span style={{ display: 'block', color: 'var(--card-muted-fg-color)', fontSize: '0.75rem', marginTop: '0.3rem' }}>
          Optional label shown when this block has multiple variants.
        </span>
      </label>

      <label>
        <span style={labelStyle}>Language</span>
        <input
          type="text"
          value={draft.language}
          onChange={(event) => updateDraft('language', event.currentTarget.value)}
          placeholder="For example, javascript or bash"
          disabled={readOnly}
          style={inputStyle}
        />
      </label>

      <label>
        <span style={labelStyle}>Code</span>
        <textarea
          value={draft.code}
          onChange={(event) => updateDraft('code', event.currentTarget.value)}
          rows={12}
          placeholder="Paste the code for this variant"
          disabled={readOnly}
          style={{ ...inputStyle, fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical' as const }}
        />
      </label>

      <label>
        <span style={labelStyle}>Filename caption</span>
        <input
          type="text"
          value={draft.filename}
          onChange={(event) => updateDraft('filename', event.currentTarget.value)}
          placeholder="Optional, for example browserstack.yml"
          disabled={readOnly}
          style={inputStyle}
        />
      </label>

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderTop: '1px solid #d1d5db',
          background: '#ffffff',
          padding: '0.75rem 0',
        }}
      >
        <span style={{ color: 'var(--card-muted-fg-color)', fontSize: '0.75rem' }}>
          {hasRequiredValues ? 'All required fields are ready to save.' : 'Language and code are required.'}
        </span>
        <button
          type="button"
          onClick={saveVariant}
          disabled={readOnly || !hasChanges || !hasRequiredValues}
          style={{
            flexShrink: 0,
            minWidth: 112,
            border: '1px solid',
            borderColor: hasChanges && hasRequiredValues ? '#1d4ed8' : '#9ca3af',
            borderRadius: 5,
            background: hasChanges && hasRequiredValues ? '#1d4ed8' : '#e5e7eb',
            color: hasChanges && hasRequiredValues ? '#ffffff' : '#374151',
            cursor: readOnly || !hasChanges || !hasRequiredValues ? 'default' : 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 700,
            padding: '0.55rem 0.8rem',
            opacity: 1,
            visibility: 'visible',
          }}
        >
          Save variant
        </button>
      </div>
    </div>
  )
}