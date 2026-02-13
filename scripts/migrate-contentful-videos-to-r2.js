/**
 * Migration script: Contentful videos → Cloudflare R2
 *
 * WARNING: This script downloads videos from Contentful, which consumes bandwidth.
 * Only run when you have sufficient Contentful bandwidth available.
 *
 * Usage:
 *   node scripts/migrate-contentful-videos-to-r2.js [--dry-run] [--limit=N]
 *
 * Options:
 *   --dry-run    Show what would be migrated without making changes
 *   --limit=N    Migrate only N videos (useful for testing or gradual migration)
 *
 * Environment variables required:
 *   DATABASE_URL
 *   VITE_R2_ACCESS_KEY_ID
 *   VITE_R2_SECRET_ACCESS_KEY
 *   VITE_R2_ENDPOINT
 *   VITE_R2_BUCKET_NAME
 *   VITE_R2_PUBLIC_URL
 */

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Load environment variables
const loadEnvFile = () => {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      envContent.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && !key.startsWith("#") && key.trim()) {
          process.env[key.trim()] = valueParts.join("=").trim();
        }
      });
    }
  } catch (error) {
    console.error("Could not load .env file:", error.message);
  }
};

loadEnvFile();

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : null;

// Validate environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "VITE_R2_ACCESS_KEY_ID",
  "VITE_R2_SECRET_ACCESS_KEY",
  "VITE_R2_ENDPOINT",
  "VITE_R2_BUCKET_NAME",
  "VITE_R2_PUBLIC_URL",
];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:");
  missingEnvVars.forEach((varName) => console.error(`  - ${varName}`));
  process.exit(1);
}

// Initialize database and R2 clients
const sql = neon(process.env.DATABASE_URL);
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

// Helper: Download file from URL
const downloadFile = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    });
  });
};

// Helper: Check if URL is a video from Contentful
const isContentfulVideo = (url) => {
  const videoExtensions = [".mp4", ".mov", ".webm", ".m4v", ".avi", ".mkv"];
  return (
    url.includes("ctfassets.net") &&
    videoExtensions.some((ext) => url.toLowerCase().includes(ext))
  );
};

// Helper: Extract filename from Contentful URL
const extractFilename = (url) => {
  const urlPath = new URL(url).pathname;
  return path.basename(urlPath);
};

// Helper: Upload to R2
const uploadToR2 = async (buffer, filename, contentType) => {
  const command = new PutObjectCommand({
    Bucket: process.env.VITE_R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  return `${process.env.VITE_R2_PUBLIC_URL}/${filename}`;
};

// Helper: Update database record
const updateMediaUrl = async (mediaId, newUrl) => {
  await sql`
    UPDATE media
    SET media_url = ${newUrl},
        updated_at = NOW()
    WHERE id = ${mediaId}
  `;
};

// Main migration function
const migrateVideo = async (video) => {
  const { id, media_url, layout } = video;
  const filename = extractFilename(media_url);

  console.log(`\n[${id}] Processing: ${filename}`);
  console.log(`  Old URL: ${media_url}`);

  if (isDryRun) {
    const newUrl = `${process.env.VITE_R2_PUBLIC_URL}/${filename}`;
    console.log(`  New URL (dry-run): ${newUrl}`);
    console.log(`  Status: SKIPPED (dry-run mode)`);
    return { id, success: true, skipped: true };
  }

  try {
    // Download from Contentful
    console.log(`  Downloading from Contentful...`);
    const buffer = await downloadFile(media_url);
    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
    console.log(`  Downloaded: ${sizeMB} MB`);

    // Upload to R2
    console.log(`  Uploading to R2...`);
    const contentType = filename.endsWith(".mp4")
      ? "video/mp4"
      : filename.endsWith(".mov")
      ? "video/quicktime"
      : filename.endsWith(".webm")
      ? "video/webm"
      : "video/mp4";

    const newUrl = await uploadToR2(buffer, filename, contentType);
    console.log(`  New URL: ${newUrl}`);

    // Update database
    console.log(`  Updating database...`);
    await updateMediaUrl(id, newUrl);

    console.log(`  Status: SUCCESS ✓`);
    return { id, success: true, oldUrl: media_url, newUrl, sizeMB };
  } catch (error) {
    console.error(`  Status: FAILED ✗`);
    console.error(`  Error: ${error.message}`);
    return { id, success: false, error: error.message };
  }
};

// Main execution
const main = async () => {
  console.log("=".repeat(70));
  console.log("Contentful → R2 Video Migration Script");
  console.log("=".repeat(70));

  if (isDryRun) {
    console.log("\n⚠️  DRY-RUN MODE: No changes will be made\n");
  }

  if (limit) {
    console.log(`\n📊 LIMIT: Processing only ${limit} videos\n`);
  }

  // Fetch videos from database
  console.log("Fetching videos from database...\n");

  const videos = await sql`
    SELECT id, media_url, layout, folder_id, created_at
    FROM media
    WHERE media_url LIKE '%ctfassets.net%'
      AND (media_url LIKE '%.mp4'
        OR media_url LIKE '%.mov'
        OR media_url LIKE '%.webm'
        OR media_url LIKE '%.m4v')
    ORDER BY created_at DESC
    ${limit ? sql`LIMIT ${limit}` : sql``}
  `;

  console.log(`Found ${videos.length} videos to migrate\n`);

  if (videos.length === 0) {
    console.log("No videos to migrate. Exiting.");
    return;
  }

  // Migrate videos sequentially
  const results = [];
  for (const video of videos) {
    const result = await migrateVideo(video);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("Migration Summary");
  console.log("=".repeat(70));

  const successful = results.filter((r) => r.success && !r.skipped);
  const failed = results.filter((r) => !r.success);
  const skipped = results.filter((r) => r.skipped);

  console.log(`Total videos: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  if (isDryRun) {
    console.log(`Skipped (dry-run): ${skipped.length}`);
  }

  if (successful.length > 0 && !isDryRun) {
    const totalSize = successful.reduce((sum, r) => sum + parseFloat(r.sizeMB), 0);
    console.log(`Total size migrated: ${totalSize.toFixed(2)} MB`);
  }

  if (failed.length > 0) {
    console.log("\nFailed migrations:");
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }

  console.log("\n" + "=".repeat(70));

  if (isDryRun) {
    console.log("\n✓ Dry-run completed. Run without --dry-run to perform migration.");
  } else {
    console.log("\n✓ Migration completed.");
  }
};

// Run migration
main().catch((error) => {
  console.error("\n❌ Migration failed:", error);
  process.exit(1);
});
