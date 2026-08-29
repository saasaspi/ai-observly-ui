import { useCallback } from 'react'
import { PortableTextInput, type PortableTextInputProps, useClient } from 'sanity'

type PortableTextPasteHandler = NonNullable<PortableTextInputProps['onPaste']>
type BodyPortableTextInputProps = PortableTextInputProps & {
  imageBlockType?: 'image' | 'docInlineImage'
}

export function BodyPortableTextInput({
  imageBlockType = 'image',
  ...props
}: BodyPortableTextInputProps) {
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
            filename: file.name || (imageBlockType === 'docInlineImage' ? 'pasted-doc-image' : 'pasted-blog-image'),
          }),
        ),
      ).then((assets) => ({
        insert: assets.map((asset) =>
          imageBlockType === 'docInlineImage'
            ? {
                _type: 'docInlineImage',
                image: {
                  _type: 'image',
                  asset: {
                    _type: 'reference',
                    _ref: asset._id,
                  },
                },
                altText: '',
              }
            : {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: asset._id,
                },
              },
        ),
        path: pasteData.path,
      }))
    },
    [client, imageBlockType, props.onPaste],
  )

  return <PortableTextInput {...props} onPaste={handlePaste} />
}

export function DocBodyPortableTextInput(props: PortableTextInputProps) {
  return <BodyPortableTextInput {...props} imageBlockType="docInlineImage" />
}