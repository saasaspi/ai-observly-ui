'use client'
import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

export function BlogShare() {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 2500)
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button type="button" onClick={copy} className="pub-btn pub-btn-secondary !h-9 !px-3.5 !text-sm">
        {state === 'copied' ? <Check className="w-4 h-4" aria-hidden="true" /> : <Link2 className="w-4 h-4" aria-hidden="true" />}
        Copy link
      </button>
      <span role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {state === 'copied' && 'Link copied'}
        {state === 'failed' && 'Could not copy. Use the address bar instead.'}
      </span>
    </span>
  )
}
