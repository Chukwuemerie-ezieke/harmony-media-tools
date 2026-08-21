export interface QueueItem {
  id: string;
  files: File[];
  tool:
    | "convert"
    | "extract"
    | "trim"
    | "compress"
    | "crop"
    | "audiofx"
    | "gif"
    | "merge";
  status: "idle" | "ready" | "processing" | "complete" | "error";
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
  error?: string;
  createdAt?: number;
}
