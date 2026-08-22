import { QueueItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, CheckCircle2, AlertCircle, FileVideo, FileAudio, Play, RotateCcw } from "lucide-react";

interface QueueListProps {
  job: QueueItem | null;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
  onRetry?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function QueueList({ job, onRemove, onDownload, onRetry }: QueueListProps) {
  if (!job) return null;
  
  const isVideo = job.files[0]?.type.startsWith("video/");
  const totalSize = job.files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-medium">Result</h3>
      <div className="border rounded-lg p-3 bg-card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded bg-muted shrink-0">
              {isVideo ? <FileVideo className="w-4 h-4" /> : <FileAudio className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">
                {job.files.length === 1 ? job.files[0].name : `${job.files.length} files`}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(totalSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {job.status === "complete" && (
              <Button size="sm" variant="default" onClick={() => onDownload(job.id)}>
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            {job.status === "error" && onRetry && (
              <Button size="sm" variant="outline" onClick={() => onRetry(job.id)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            {job.status !== "processing" && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => onRemove(job.id)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {job.status === "processing" && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span>Processing...</span>
              <span>{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-1.5" />
            {job.message && <p className="text-[10px] text-muted-foreground truncate">{job.message}</p>}
          </div>
        )}

        {job.status === "complete" && job.outputBlob && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 p-2 rounded">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="flex-1">
                Completed successfully. Output: {formatFileSize(job.outputBlob.size)}
                {totalSize > job.outputBlob.size ?
                  ` (Saved ${Math.round((1 - job.outputBlob.size / totalSize) * 100)}%)` :
                  ''}
              </span>
            </div>
            {job.outputBlob.type.startsWith('video/') && (
               <video
                 src={URL.createObjectURL(job.outputBlob)}
                 controls
                 className="w-full max-h-32 object-contain bg-black/5 rounded"
               />
            )}
            {job.outputBlob.type.startsWith('audio/') && (
               <audio
                 src={URL.createObjectURL(job.outputBlob)}
                 controls
                 className="w-full h-8"
               />
            )}
          </div>
        )}

        {job.status === "error" && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>Processing failed. {job.error || job.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
