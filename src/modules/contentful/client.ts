const getContentfulConfig = () => {
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN
  const spaceId = process.env.CONTENTFUL_SPACE_ID
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID

  if (!accessToken || !spaceId || !environmentId) {
    throw new Error('Missing Contentful environment variables')
  }

  return { accessToken, spaceId, environmentId }
}

export interface ContentfulUploadResult {
  assetId: string
  url: string
  filename: string
  contentType: string
}

export const uploadToContentful = async (
  file: File,
  filename: string
): Promise<ContentfulUploadResult> => {
  const { accessToken, spaceId, environmentId } = getContentfulConfig()

  const arrayBuffer = await file.arrayBuffer()

  const uploadRes = await fetch(`https://upload.contentful.com/spaces/${spaceId}/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    },
    body: arrayBuffer,
  })

  if (!uploadRes.ok) {
    throw new Error(`Failed to create upload: ${uploadRes.status}`)
  }

  const uploadJson = await uploadRes.json()

  if (!uploadJson.sys?.id) {
    throw new Error('Failed to create upload - no ID returned')
  }

  const assetRes = await fetch(
    `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/assets`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
      },
      body: JSON.stringify({
        fields: {
          title: {
            'en-US': filename,
          },
          file: {
            'en-US': {
              contentType: file.type,
              fileName: filename,
              uploadFrom: {
                sys: {
                  type: 'Link',
                  linkType: 'Upload',
                  id: uploadJson.sys.id,
                },
              },
            },
          },
        },
      }),
    }
  )

  if (!assetRes.ok) {
    throw new Error(`Failed to create asset: ${assetRes.status}`)
  }

  const assetJson = await assetRes.json()

  await fetch(
    `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/assets/${assetJson.sys.id}/files/en-US/process`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Contentful-Version': assetJson.sys.version.toString(),
      },
    }
  )

  await new Promise((resolve) => setTimeout(resolve, 2000))

  const publishRes = await fetch(
    `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/assets/${assetJson.sys.id}/published`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Contentful-Version': (assetJson.sys.version + 1).toString(),
      },
    }
  )

  const publishedAsset = await publishRes.json()
  const assetUrl = publishedAsset.fields?.file?.['en-US']?.url

  return {
    assetId: assetJson.sys.id,
    url: assetUrl ? `https:${assetUrl}` : '',
    filename,
    contentType: file.type,
  }
}