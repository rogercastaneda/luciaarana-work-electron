import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const getR2Client = () => {
  const accessKeyId = process.env.VITE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.VITE_R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.VITE_R2_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    console.error("Missing R2 environment variables:", {
      hasAccessKeyId: !!accessKeyId,
      hasSecretAccessKey: !!secretAccessKey,
      hasEndpoint: !!endpoint,
    });
    throw new Error("Missing R2 environment variables");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export const uploadToR2 = async (fileBuffer, filename, contentType) => {
  try {
    const bucketName = process.env.VITE_R2_BUCKET_NAME;
    const publicUrl = process.env.VITE_R2_PUBLIC_URL;

    if (!bucketName || !publicUrl) {
      throw new Error("Missing R2 bucket configuration");
    }

    console.log(`Uploading ${filename} to R2...`);

    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: Buffer.from(fileBuffer),
      ContentType: contentType,
    });

    await client.send(command);

    const fileUrl = `${publicUrl}/${filename}`;

    console.log(`Successfully uploaded to R2: ${fileUrl}`);

    return {
      url: fileUrl,
      filename,
      contentType,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error(
      `Failed to upload to R2: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const deleteFromR2 = async (filename) => {
  try {
    const bucketName = process.env.VITE_R2_BUCKET_NAME;

    if (!bucketName) {
      console.error("Missing R2 bucket name");
      return false;
    }

    const client = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });

    await client.send(command);

    console.log(`Successfully deleted from R2: ${filename}`);
    return true;
  } catch (error) {
    console.error("Error deleting from R2:", error);
    return false;
  }
};
