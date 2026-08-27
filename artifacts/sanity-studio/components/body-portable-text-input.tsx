import { useCallback } from 'react'
import { PortableTextInput, type PortableTextInputProps, useClient } from 'sanity'

type PortableTextPasteHandler = NonNullable<PortableTextInputProps['onPaste']>

export function BodyPortableTextInput(props: PortableTextInputProps) {
  const client = useClient({ apiVersion: '2025-02-19' })

  const handlePaste = useCallback<PortableTextPasteHandler>(
    (pasteData) => {
      const imageFiles = Array.from(pasteData.event.clipboardData.files).filter((file) =>
        file.type.startsWith('image/'),
      )

      if (imageFiles.length === 0) {
        return props.onPaste?.(pasteData)
      }

      return Promise.all(
        imageFiles.map((file) =>
          client.assets.upload('image', file, {
            filename: file.name || 'pasted-blog-image',
          }),
        ),
      ).then((assets) => ({
        insert: assets.map((asset) => ({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        })),
        path: pasteData.path,
      }))
    },
    [client, props.onPaste],
  )

  return <PortableTextInput {...props} onPaste={handlePaste} />
}