import { describe, it, expect, vi } from 'vitest';

// Mock the API client module
vi.mock('./client', () => ({
  api: {
    post: vi.fn(),
  },
}));

import { uploadApi } from './upload';
import { api } from './client';

describe('uploadApi', () => {
  it('should upload a single file', async () => {
    const mockResponse = {
      data: {
        data: {
          filename: 'abc.jpg',
          path: 'user-1/abc.jpg',
          url: 'http://localhost/uploads/user-1/abc.jpg',
        },
      },
    };
    vi.mocked(api.post).mockResolvedValue(mockResponse);

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadApi.uploadFile(file);

    expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(result.filename).toBe('abc.jpg');
  });

  it('should upload multiple files', async () => {
    const mockResponse = {
      data: {
        data: [
          { filename: 'a.jpg', path: 'user-1/a.jpg', url: 'http://localhost/uploads/user-1/a.jpg' },
          { filename: 'b.pdf', path: 'user-1/b.pdf', url: 'http://localhost/uploads/user-1/b.pdf' },
        ],
      },
    };
    vi.mocked(api.post).mockResolvedValue(mockResponse);

    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.pdf', { type: 'application/pdf' }),
    ];
    const result = await uploadApi.uploadMultiple(files);

    expect(api.post).toHaveBeenCalledWith('/upload/multiple', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(result).toHaveLength(2);
  });
});
