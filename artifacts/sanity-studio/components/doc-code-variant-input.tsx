import { useEffect, useState } from 'react'
import { set, type ObjectInputProps } from 'sanity'

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
  const savedDraft = draftFromValue(value)

  useEffect(() => {
    setDraft(draftFromValue(value))
  }, [value?.tabLabel, value?.language, value?.code, value?.filename])

  const hasChanges =
    draft.tabLabel !== savedDraft.tabLabel ||
    draft.language !== savedDraft.language ||
    draft.code !== savedDraft.code ||
    draft.filename !== savedDraft.filename
  const canSave = !readOnly && hasChanges && Boolean(draft.language.trim() && draft.code.trim())

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
  }

  const inputStyle = {
    boxSizing: 'border-box' as const,
    width: '100%',
    border: '1px solid #a8b1bd',
    borderRadius: 5,
    background: '#ffffff',
    color: '#1f2937',
    font: 'inherit',
    fontSize: 14,
    padding: '9px 10px',
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
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
        <span style={hintStyle}>Optional label shown when this block has multiple variants.</span>
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
          rows={14}
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
          placeholder="For example, browserstack.yml"
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
          gap: 12,
          borderTop: '1px solid #d1d5db',
          background: '#ffffff',
          padding: '12px 0',
        }}
      >
        <span style={{ color: '#6b7280', fontSize: 12 }}>
          {hasChanges ? 'Changes are not saved yet.' : 'All changes are saved.'}
        </span>
        <button
          type="button"
          onClick={saveVariant}
          disabled={!canSave}
          style={{
            minWidth: 112,
            border: '1px solid',
            borderColor: canSave ? '#1d4ed8' : '#9ca3af',
            borderRadius: 5,
            background: canSave ? '#1d4ed8' : '#e5e7eb',
            color: canSave ? '#ffffff' : '#374151',
            cursor: canSave ? 'pointer' : 'default',
            fontSize: 13,
            fontWeight: 700,
            padding: '9px 13px',
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

const labelStyle = {
  display: 'block',
  color: '#374151',
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
}

const hintStyle = {
  display: 'block',
  color: '#6b7280',
  fontSize: 12,
  marginTop: 5,
}