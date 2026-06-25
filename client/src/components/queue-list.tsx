import { QueueItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, CheckCircle2, AlertCircle, FileVideo, FileAudio, Play } from "lucide-react";

interface QueueListProps {
  queue: QueueItem[];
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function QueueList({ queue, onRemove, onDownload }: QueueListProps) {
  if (queue.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-medium">Processing Queue ({queue.length})</h3>
      {queue.map((item) => {
        const isVideo = item.file.type.startsWith("video/");
        return (
          <div key={item.id} className="border rounded-lg p-3 bg-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded bg-muted shrink-0">
                  {isVideo ? <FileVideo className="w-4 h-4" /> : <FileAudio className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.status === "done" && (
                  <Button size="sm" variant="default" onClick={() => onDownload(item.id)}>
                    Download
                  </Button>
                )}
                {item.status !== "processing" && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => onRemove(item.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {item.status === "processing" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Processing...</span>
                  <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-1.5" />
                {item.message && <p className="text-[10px] text-muted-foreground truncate">{item.message}</p>}
              </div>
            )}

            {item.status === "done" && item.outputBlob && (
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 p-2 rounded">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="flex-1">
                    Completed successfully. Output: {formatFileSize(item.outputBlob.size)}
                    {item.file.size > item.outputBlob.size ?
                      ` (Saved ${Math.round((1 - item.outputBlob.size / item.file.size) * 100)}%)` :
                      ''}
                  </span>
                </div>
                {item.outputBlob.type.startsWith('video/') && (
                   <video
                     src={URL.createObjectURL(item.outputBlob)}
                     controls
                     className="w-full max-h-32 object-contain bg-black/5 rounded"
                   />
                )}
                {item.outputBlob.type.startsWith('audio/') && (
                   <audio
                     src={URL.createObjectURL(item.outputBlob)}
                     controls
                     className="w-full h-8"
                   />
                )}
              </div>
            )}

            {item.status === "error" && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>Processing failed. {item.message}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
