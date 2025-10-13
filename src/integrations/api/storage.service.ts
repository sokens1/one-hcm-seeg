import { api } from "./client";
import { endpoints } from "./endpoints";

export const storageService = {
  async upload(file: File, folder: string, filename?: string): Promise<{ path: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);
    if (filename) form.append('filename', filename);
    const { data } = await api.post<{ path: string }>(endpoints.storageUpload, form);
    return data as { path: string };
  },
  async remove(path: string): Promise<void> {
    await api.post(endpoints.storageDelete, { path });
  },
  async getPublicUrl(path: string): Promise<string> {
    const { data } = await api.get<{ url: string }>(endpoints.storageGetUrl(path));
    return (data as any)?.url ?? path;
  },
  async download(path: string): Promise<Blob> {
    const { data } = await api.get<Blob>(endpoints.storageDownload(path), { responseType: 'blob' });
    return data as Blob;
  },
};




