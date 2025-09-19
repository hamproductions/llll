# Google Cloud Storage Setup for Assets

## Setup Instructions

1. **Create a Google Cloud Storage bucket:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/storage)
   - Create a new bucket (e.g., `your-project-assets`)
   - Make the bucket publicly readable:
     - Go to Bucket Permissions
     - Add member: `allUsers`
     - Role: `Storage Object Viewer`

2. **Get Service Account credentials (for uploading):**
   - Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Create a new service account or use existing
   - Create and download a JSON key
   - Save as `gcs-key.json` in project root

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```
   GCS_BUCKET_NAME=your-bucket-name
   GCS_PROJECT_ID=your-project-id
   GCS_KEY_FILE=./gcs-key.json
   PUBLIC_ENV__GCS_BASE_URL=https://storage.googleapis.com/your-bucket-name
   ```

4. **Install dependencies:**
   ```bash
   bun install
   ```

5. **Upload assets to GCS:**
   ```bash
   bun run upload-assets
   ```

   This will upload:
   - `public/assets/` → `gs://your-bucket/assets/`
   - `public/cards/` → `gs://your-bucket/cards/`
   - `public/album-art/` → `gs://your-bucket/album-art/`

6. **Remove local assets (optional):**
   After confirming uploads work:
   ```bash
   rm -rf public/assets public/cards public/album-art
   ```

## How it Works

- When `PUBLIC_ENV__GCS_BASE_URL` is set, all asset URLs will point to GCS
- When not set, assets will be served locally (for development)
- The `getAssetUrl()` function in `src/utils/assets.ts` handles the URL generation

## Deployment

For production builds:
```bash
PUBLIC_ENV__GCS_BASE_URL=https://storage.googleapis.com/your-bucket-name bun run build
```

## Cost Considerations

- Storage: ~$0.02/GB/month
- Bandwidth: ~$0.12/GB (first 10TB/month)
- Consider using CDN (CloudFlare) in front of GCS to reduce bandwidth costs