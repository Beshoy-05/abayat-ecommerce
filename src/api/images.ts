import { apiClient } from './client';
import { ImageUploadResult } from '@/types/api';

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

    return res.data;
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

      return (res.data || []).map((img) => img.secureUrl || img.url);
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
};
