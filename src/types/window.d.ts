export interface R2UploadResult {
  url: string;
  filename: string;
  contentType: string;
}

export interface R2UploadResponse {
  success: boolean;
  data?: R2UploadResult;
  error?: string;
}

export interface R2DeleteResponse {
  success: boolean;
}

export interface R2Api {
  upload: (
    fileBuffer: ArrayBuffer,
    filename: string,
    contentType: string
  ) => Promise<R2UploadResponse>;
  delete: (filename: string) => Promise<R2DeleteResponse>;
}

declare global {
  interface Window {
    r2Api: R2Api;
  }
}
