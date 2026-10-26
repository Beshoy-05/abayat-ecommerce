import { apiClient } from './client';
import { ImageUploadResult } from '@/types/api';

// In-memory cache to map URLs to their Cloudinary publicId during the active session
const publicIdCache = new Map<string, string>();

/**
 * Extracts Cloudinary publicId from a URL or returns the publicId if already clean.
 * Handles transformed URLs, versions (v12345...), folders with slashes, and stripping extensions.
 * Returns null if the URL is external (e.g. Unsplash) or empty.
 */
export const extractPublicIdFromUrl = (urlOrPublicId: string | null | undefined): string | null => {
  if (!urlOrPublicId || typeof urlOrPublicId !== 'string') return null;

  const trimmed = urlOrPublicId.trim();
  if (!trimmed) return null;

  // 1. Direct hit in active session cache
  if (publicIdCache.has(trimmed)) {
    return publicIdCache.get(trimmed)!;
  }

  // 2. If it's not an HTTP/HTTPS URL, it is already a raw publicId (e.g. 'abaya-ecommerce/abaya_20261026_xyz123')
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 3. Ignore non-Cloudinary images (e.g. Unsplash, placeholder images)
  if (!trimmed.includes('cloudinary.com')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const uploadIndex = parsed.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let path = parsed.pathname.slice(uploadIndex + '/upload/'.length);

    // 4. Skip transformation segments (e.g., c_fill,w_300/ or s--...--/)
    const parts = path.split('/');
    while (
      parts.length > 1 &&
      (parts[0].includes(',') ||
        parts[0].startsWith('s--') ||
        /^[a-z]{1,2}_[a-zA-Z0-9_]+$/.test(parts[0]))
    ) {
      parts.shift();
    }
    path = parts.join('/');

    // 5. Strip version segment prefix e.g. "v1792652133/"
    path = path.replace(/^v\d+\//, '');

    // 6. Strip file extension at the end (.jpg, .png, .webp, etc.)
    const lastDot = path.lastIndexOf('.');
    if (lastDot !== -1) {
      path = path.substring(0, lastDot);
    }

    return path || null;
  } catch {
    return null;
  }
};

/**
 * Register a publicId for a URL in the session cache
 */
export const registerImagePublicId = (url: string, publicId: string) => {
  if (url && publicId) {
    publicIdCache.set(url, publicId);
  }
};

export const imagesService = {
  // POST /api/Images/upload
  // Upload file (such as payment transfer receipt or product photos) to Cloudinary via backend
  uploadImage: async (file: File): Promise<ImageUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ImageUploadResult>('/api/Images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = res.data;
    if (data?.publicId) {
      if (data.url) publicIdCache.set(data.url, data.publicId);
      if (data.secureUrl) publicIdCache.set(data.secureUrl, data.publicId);
    }

    return data;
  },

  // POST /api/Images/upload-multiple
  uploadMultipleImages: async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const res = await apiClient.post<ImageUploadResult[]>('/api/Images/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const results = res.data || [];
      results.forEach((img) => {
        if (img?.publicId) {
          if (img.url) publicIdCache.set(img.url, img.publicId);
          if (img.secureUrl) publicIdCache.set(img.secureUrl, img.publicId);
        }
      });

      return results.map((img) => img.secureUrl || img.url);
    } catch (err) {
      // Fallback: upload one by one in parallel if multi fails
      const urls: string[] = [];
      for (const file of files) {
        const single = await imagesService.uploadImage(file);
        if (single.secureUrl || single.url) {
          urls.push(single.secureUrl || single.url);
        }
      }
      return urls;
    }
  },

  // POST /api/Images/upload-multiple with full results including publicId
  uploadMultipleImagesDetailed: async (files: File[]): Promise<ImageUploadResult[]> => {
    if (!files || files.length === 0) return [];

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }

      const res = await apiClient.post<ImageUploadResult[]>('/api/Images/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const results = res.data || [];
      results.forEach((img) => {
        if (img?.publicId) {
          if (img.url) publicIdCache.set(img.url, img.publicId);
          if (img.secureUrl) publicIdCache.set(img.secureUrl, img.publicId);
        }
      });

      return results;
    } catch (err) {
      const results: ImageUploadResult[] = [];
      for (const file of files) {
        const single = await imagesService.uploadImage(file);
        results.push(single);
      }
      return results;
    }
  },

  // DELETE /api/Images/{publicId}
  // Delete image from Cloudinary to clean up orphaned images and storage space
  deleteImage: async (publicIdOrUrl: string): Promise<boolean> => {
    try {
      const publicId = extractPublicIdFromUrl(publicIdOrUrl);
      if (!publicId) {
        // Not a Cloudinary image or empty, silently return without error
        return false;
      }

      const encodedPublicId = encodeURIComponent(publicId);
      const res = await apiClient.delete(`/api/Images/${encodedPublicId}`);

      // Cleanup cache
      publicIdCache.delete(publicIdOrUrl);
      for (const [key, val] of Array.from(publicIdCache.entries())) {
        if (val === publicId || key === publicIdOrUrl) {
          publicIdCache.delete(key);
        }
      }

      console.log('Image deleted successfully from Cloudinary:', publicId);
      return res.status === 200 || res.status === 204;
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      return false;
    }
  },

  // Helper exposing publicId extraction
  extractPublicId: extractPublicIdFromUrl,
};

