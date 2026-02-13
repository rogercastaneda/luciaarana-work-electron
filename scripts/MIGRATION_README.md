# Video Migration: Contentful → Cloudflare R2

## ⚠️ CRITICAL WARNING

**DO NOT run this migration while Contentful bandwidth is at 95% or higher.**

Downloading videos from Contentful **will consume bandwidth** and could block your account. Wait until your Contentful bandwidth usage resets (typically at the start of each billing cycle).

## Current Status

- ✅ New video uploads go to R2 (unlimited bandwidth)
- ✅ Images optimized with WebP/AVIF
- ⏳ 70 existing videos remain on Contentful (pending migration)

## When to Run Migration

**Safe to migrate when:**
- Contentful bandwidth usage < 50%
- Early in billing cycle (first week of month)
- You have confirmed bandwidth reset

**DO NOT migrate when:**
- Bandwidth usage > 80%
- Near end of billing cycle
- Contentful shows bandwidth warnings

## Usage

### 1. Dry-run (recommended first)

Test the migration without making any changes:

```bash
cd /Users/roger/git/luciaarana/luciaarana-electron
node scripts/migrate-contentful-videos-to-r2.js --dry-run
```

This will show:
- How many videos will be migrated
- Old URLs vs new URLs
- No actual downloads or changes

### 2. Test migration (limited)

Migrate only a few videos to test:

```bash
node scripts/migrate-contentful-videos-to-r2.js --limit=5
```

This migrates only 5 videos. Verify they work on the site before continuing.

### 3. Full migration

Once confirmed safe:

```bash
node scripts/migrate-contentful-videos-to-r2.js
```

This will migrate all 70 videos sequentially.

## What the Script Does

1. **Queries database** for all Contentful video URLs
2. **Downloads each video** from Contentful (⚠️ uses bandwidth)
3. **Uploads to R2** via AWS S3 API
4. **Updates database** with new R2 URLs
5. **Keeps old videos** on Contentful (safe to delete later)

## Monitoring Progress

The script outputs:
```
[video-id] Processing: filename.mp4
  Old URL: https://videos.ctfassets.net/...
  Downloading from Contentful...
  Downloaded: 25.3 MB
  Uploading to R2...
  New URL: https://pub-...r2.dev/...
  Updating database...
  Status: SUCCESS ✓
```

## After Migration

1. **Test the site** - Verify videos play correctly
2. **Check R2 dashboard** - Confirm videos uploaded
3. **Monitor Contentful** - Old videos still there (backup)
4. **Optional cleanup** - Delete old videos from Contentful after confirming everything works

## Rollback

If something goes wrong:

```sql
-- Rollback a single video
UPDATE media
SET media_url = 'https://videos.ctfassets.net/old-url.mp4'
WHERE id = 'video-id';

-- Check what was migrated
SELECT id, media_url, updated_at
FROM media
WHERE media_url LIKE '%r2.dev%'
ORDER BY updated_at DESC;
```

## Bandwidth Calculation

Example estimate:
- 70 videos × ~30MB average = ~2.1GB download from Contentful
- This is 4.2% of 50GB limit
- Safe to run when usage < 50%
- **UNSAFE** when usage > 95% (current status)

## Recommendations

1. **Wait for bandwidth reset** before migrating
2. **Run dry-run first** to see what will happen
3. **Test with --limit=5** before full migration
4. **Migrate early in billing cycle** for safety buffer
5. **Keep Contentful videos** for a few weeks as backup
6. **Monitor site** after migration to confirm videos work

## Questions?

- When does Contentful bandwidth reset? Check your billing cycle in Contentful dashboard
- How to check current usage? Contentful dashboard → Settings → Billing
- What if migration fails? Videos remain on Contentful, database can be rolled back
