/**
 * Cloudinary Upload Utility
 * 
 * Helper functions for uploading images to Cloudinary
 */

export interface UploadResponse {
  url: string;
  public_id: string;
}

export async function uploadImage(
  file: File,
  type: 'logo' | 'avatar'
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('folder', 'invoiceme');

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  return response.json();
}

export async function deleteImage(publicId: string): Promise<boolean> {
  const response = await fetch(`/api/upload?public_id=${publicId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete image');
  }

  const result = await response.json();
  return result.success;
}

