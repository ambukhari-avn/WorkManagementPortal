// attachment.model.ts
export interface Attachment {
  id: number;
  fileName: string;
  fileSizeBytes: number;
  uploadedByName: string;
  uploadedAt: string;
}