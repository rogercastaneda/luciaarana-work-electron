// Contentful configuration will be accessed directly from import.meta.env

export interface UploadResult {
  assetId: string
  url: string | null
  filename: string
  contentType: string
}

export async function uploadToContentful(file: File, filename: string): Promise<UploadResult> {
  try {
    const CONTENTFUL_ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN
    const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID
    const CONTENTFUL_ENVIRONMENT_ID = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT_ID
    
    console.log("DEBUG - Environment variables:", {
      CONTENTFUL_ACCESS_TOKEN,
      CONTENTFUL_SPACE_ID,
      CONTENTFUL_ENVIRONMENT_ID,
      hasAccessToken: !!CONTENTFUL_ACCESS_TOKEN,
      hasSpaceId: !!CONTENTFUL_SPACE_ID,
      hasEnvironmentId: !!CONTENTFUL_ENVIRONMENT_ID,
    })
    
    if (!CONTENTFUL_ACCESS_TOKEN || !CONTENTFUL_SPACE_ID || !CONTENTFUL_ENVIRONMENT_ID) {
      console.error("Missing Contentful environment variables:", {
        hasAccessToken: !!CONTENTFUL_ACCESS_TOKEN,
        hasSpaceId: !!CONTENTFUL_SPACE_ID,
        hasEnvironmentId: !!CONTENTFUL_ENVIRONMENT_ID,
      })
      throw new Error("Missing Contentful environment variables")
    }

    console.log("Converting file to array buffer...")
    const arrayBuffer = await file.arrayBuffer()

    console.log("Creating upload via direct API...")
    const uploadRes = await fetch(`https://upload.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      body: arrayBuffer,
    })

    console.log("Upload response status:", uploadRes.status)
    const uploadJson = await uploadRes.json()
    console.log("Upload response body:", uploadJson)

    if (!uploadRes.ok) {
      console.error("Upload failed with status:", uploadRes.status, uploadJson)
      throw new Error(`Failed to create upload: ${JSON.stringify(uploadJson)}`)
    }

    if (!uploadJson.sys || !uploadJson.sys.id) {
      console.error("Upload creation failed - no sys.id returned:", uploadJson)
      throw new Error("Failed to create upload - no ID returned")
    }

    console.log("Upload created successfully:", uploadJson.sys.id)

    const assetRes = await fetch(`https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT_ID}/assets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        "Content-Type": "application/vnd.contentful.management.v1+json",
      },
      body: JSON.stringify({
        fields: {
          title: {
            "en-US": filename,
          },
          file: {
            "en-US": {
              contentType: file.type,
              fileName: filename,
              uploadFrom: {
                sys: {
                  type: "Link",
                  linkType: "Upload",
                  id: uploadJson.sys.id,
                },
              },
            },
          },
        },
      }),
    })

    console.log("Asset creation response status:", assetRes.status)
    const assetJson = await assetRes.json()
    console.log("Asset creation response body:", assetJson)

    if (!assetRes.ok) {
      console.error("Asset creation failed:", assetRes.status, assetJson)
      throw new Error(`Failed to create asset: ${JSON.stringify(assetJson)}`)
    }

    // Process the asset
    const processRes = await fetch(
      `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT_ID}/assets/${assetJson.sys.id}/files/en-US/process`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
          "X-Contentful-Version": assetJson.sys.version.toString(),
        },
      },
    )

    if (!processRes.ok) {
      console.error("Asset processing failed:", processRes.status)
    }

    // Wait a bit for processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Publish the asset
    const publishRes = await fetch(
      `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT_ID}/assets/${assetJson.sys.id}/published`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
          "X-Contentful-Version": (assetJson.sys.version + 1).toString(),
        },
      },
    )

    if (!publishRes.ok) {
      console.error("Asset publishing failed:", publishRes.status)
    }

    const publishedAsset = await publishRes.json()

    return {
      assetId: assetJson.sys.id,
      url: publishedAsset.fields?.file?.["en-US"]?.url ? `https:${publishedAsset.fields.file["en-US"].url}` : null,
      filename: filename,
      contentType: file.type,
    }
  } catch (error) {
    console.error("Error uploading to Contentful:", error)
    throw new Error(
      `Failed to upload to Contentful: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

export async function deleteFromContentful(assetId: string): Promise<boolean> {
  try {
    const CONTENTFUL_ACCESS_TOKEN = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN
    const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID
    const CONTENTFUL_ENVIRONMENT_ID = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT_ID
    
    if (!CONTENTFUL_ACCESS_TOKEN || !CONTENTFUL_SPACE_ID || !CONTENTFUL_ENVIRONMENT_ID) {
      console.error("Missing Contentful environment variables for deletion")
      return false
    }

    // First, unpublish the asset
    const unpublishRes = await fetch(
      `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT_ID}/assets/${assetId}/published`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        },
      },
    )

    if (!unpublishRes.ok) {
      console.warn("Failed to unpublish asset, continuing with deletion:", unpublishRes.status)
    }

    // Then delete the asset
    const deleteRes = await fetch(
      `https://api.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT_ID}/assets/${assetId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
        },
      },
    )

    if (!deleteRes.ok) {
      console.error("Failed to delete asset from Contentful:", deleteRes.status)
      return false
    }

    console.log("Asset deleted successfully from Contentful:", assetId)
    return true
  } catch (error) {
    console.error("Error deleting from Contentful:", error)
    return false
  }
}