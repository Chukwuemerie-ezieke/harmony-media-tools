export interface QueueItem {
  id: string;
  file: File;
  status: "pending" | "processing" | "done" | "error";
  progress: number;
  message?: string;
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
  };
  outputBlob?: Blob;
  outputFilename?: string;
  overrideSettings?: any;
}
