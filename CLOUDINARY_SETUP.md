# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in the invoiceme application.

## What Cloudinary Does

Cloudinary handles:
- **Business Logo Upload**: Users can upload their business logo which appears on invoices
- **Profile Picture Upload**: Users can upload their profile picture

## Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com
2. Click "Sign Up" (free tier available)
3. Complete the registration process
4. Verify your email if required

## Step 2: Get Your Cloudinary Credentials

1. After logging in, go to your **Dashboard**
2. You'll see your account details:
   - **Cloud Name**: Your unique cloud name
   - **API Key**: Your API key
   - **API Secret**: Your API secret (click "Reveal" to see it)

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Cloudinary credentials:
   ```env
   CLOUD_NAME=your-cloud-name
   CLOUD_API=your-api-key
   CLOUD_SECRET=your-api-secret
   ```

3. **Important**: Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 4: Install Dependencies

The Cloudinary package is already added to `package.json`. Install it:

```bash
npm install
```

## How It Works

### Upload Flow

1. User selects an image file
2. File is validated (type and size)
3. Image is uploaded to Cloudinary via `/api/upload` route
4. Cloudinary returns a secure URL
5. URL is saved to database (settings for logo, profiles for avatar)

### Image Storage

- **Business Logos**: Stored in `invoiceme/logo/` folder
- **Profile Pictures**: Stored in `invoiceme/avatar/` folder
- Images are automatically optimized and transformed
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, WebP, GIF

### Image Transformations

Cloudinary automatically:
- Resizes images (logos: 800x800, avatars: 400x400)
- Optimizes quality
- Converts to appropriate format
- Maintains aspect ratio

## API Routes

### POST `/api/upload`
Uploads an image to Cloudinary.

**Request:**
- `file`: Image file (FormData)
- `type`: 'logo' or 'avatar'
- `folder`: Optional folder name (default: 'invoiceme')

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "invoiceme/logo/user_id_logo_timestamp"
}
```

### DELETE `/api/upload?public_id=...`
Deletes an image from Cloudinary.

**Response:**
```json
{
  "success": true
}
```

## Security

- ✅ All uploads require authentication
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ User-specific folder structure
- ✅ Secure URLs returned from Cloudinary

## Usage in Components

### Upload Business Logo

```typescript
import { uploadImage } from '@/lib/cloudinary';

const handleUpload = async (file: File) => {
  try {
    const result = await uploadImage(file, 'logo');
    // result.url contains the Cloudinary URL
    updateSettings({ businessLogo: result.url });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Upload Profile Picture

```typescript
import { uploadImage } from '@/lib/cloudinary';
import { useAuth } from '@/app/context/AuthContext';

const { updateProfile } = useAuth();

const handleUpload = async (file: File) => {
  try {
    const result = await uploadImage(file, 'avatar');
    await updateProfile({ avatar_url: result.url });
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## Troubleshooting

### "Unauthorized" Error
- Check that user is logged in
- Verify Supabase authentication is working

### "Invalid file type" Error
- Ensure file is an image (JPEG, PNG, WebP, or GIF)
- Check file extension matches MIME type

### "File size too large" Error
- Maximum file size is 5MB
- Compress image before uploading

### "Failed to upload image" Error
- Check Cloudinary credentials in `.env.local`
- Verify Cloudinary account is active
- Check browser console for detailed error

### Images Not Displaying
- Verify Cloudinary URL is saved correctly in database
- Check that URL is accessible (not expired)
- Ensure CORS is configured in Cloudinary (usually automatic)

## Cloudinary Dashboard

You can manage your images in the Cloudinary Dashboard:
- View all uploaded images
- Delete images manually
- View usage statistics
- Configure transformations

## Free Tier Limits

Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

For production use, consider upgrading if you expect high traffic.

## Next Steps

1. ✅ Set up Cloudinary account
2. ✅ Add credentials to `.env.local`
3. ✅ Test logo upload in Settings
4. ✅ Test profile picture upload in Settings
5. ⏳ Verify images appear on invoices (for logo)
6. ⏳ Verify profile picture appears in navigation (optional)

## Support

- Cloudinary Docs: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com
- Cloudinary Discord: https://discord.gg/cloudinary

