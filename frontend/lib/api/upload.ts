import { api } from './client';

export interface UploadResult {
  filename: string;
  path: string;
  url: string;
}

export const uploadApi = {
  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  async uploadMultiple(files: File[]): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },
};
