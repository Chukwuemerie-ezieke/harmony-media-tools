import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMergeFiles } from "@/hooks/use-merge-files";
import { FileAudio, FileVideo, Link2, Loader2, LockKeyhole, ShieldCheck, Upload, X } from "lucide-react";
import "./harmony-workspace.css";

const VIDEO_FORMATS = ["mp4", "webm", "avi", "mkv", "mov"];
const AUDIO_FORMATS = ["mp3", "wav", "aac", "ogg", "flac", "m4a"];
const ALL_FORMATS = [...VIDEO_FORMATS, ...AUDIO_FORMATS];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MergePanel() {
  const { toast } = useToast();
  const { mergeFiles, progress, message } = useMergeFiles();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState("mp4");
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState(0);

  const addFiles = (incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter(
      (file) => file.type.startsWith("video/") || file.type.startsWith("audio/")
    );
    if (valid.length === 0) {
      toast({
        title: "Unsupported file",
        description: "Please select valid video or audio files.",
        variant: "destructive",
      });
      return;
    }
    setFiles((prev) => [...prev, ...valid]);
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Add at least 2 files",
        description: "Merge requires two or more files of the same type.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const result = await mergeFiles(files, outputFormat);
      if (!result) {
        toast({
          title: "Merge failed",
          description: "Use files with the same resolution and codecs, then try again.",
          variant: "destructive",
        });
        return;
      }

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(result.blob);
      setOutputUrl(url);
      setOutputName(result.filename);
      setOutputSize(result.blob.size);
      toast({
        title: "Merge complete",
        description: "Your combined file is ready to download.",
      });
    } catch {
      toast({
        title: "Merge failed",
        description: "An unexpected error occurred while merging.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadOutput = () => {
    if (!outputUrl || !outputName) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = outputName;
    link.click();
  };

  return (
    <section className="harmony-workspace">
      <div className="harmony-workspace__shell">
        <header className="harmony-workspace__hero">
          <div className="harmony-workspace__eyebrow">
            <ShieldCheck className="h-3.5 w-3.5" /> Harmony Media Tools
          </div>
          <h2 className="harmony-workspace__title">Merge media, privately.</h2>
          <p className="harmony-workspace__subtitle">
            Combine matching video or audio files in one browser-based workspace. Your files are processed locally and never uploaded to a server.
          </p>
          <div className="harmony-workspace__trust">
            <LockKeyhole className="h-3.5 w-3.5" /> Files stay on your device
          </div>
        </header>

        <div className="harmony-workspace__body space-y-5">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="video/*,audio/*"
            className="hidden"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <button
            type="button"
            className="harmony-workspace__dropzone w-full px-4 py-8 text-center"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mx-auto mb-3 h-7 w-7 text-primary" />
            <p className="text-sm font-semibold">Add two or more files to merge</p>
            <p className="mt-1 text-xs text-muted-foreground">
              MP4, WebM, MOV, MP3, WAV and other supported media formats
            </p>
          </button>

          {files.length > 0 && (
            <section>
              <p className="harmony-workspace__section-label">Merge queue · {files.length} file{files.length === 1 ? "" : "s"}</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={`${file.name}-${file.size}-${index}`} className="harmony-workspace__file flex items-center justify-between rounded-md border px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {file.type.startsWith("video/") ? (
                        <FileVideo className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <FileAudio className="h-4 w-4 shrink-0 text-secondary" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button aria-label={`Remove ${file.name}`} type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <label className="harmony-workspace__section-label block">Output format</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_FORMATS.map((format) => (
                    <SelectItem key={format} value={format}>
                      .{format.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="harmony-workspace__action w-full sm:w-auto" onClick={handleMerge} disabled={files.length < 2 || processing}>
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
              {processing ? "Merging files..." : "Merge files"}
            </Button>
          </section>

          <div className="harmony-workspace__notice px-3 py-2.5 text-xs leading-relaxed">
            <strong>For best results:</strong> merge files with the same media type, resolution, frame rate, and codecs. Large files may require additional browser memory.
          </div>

          {processing && (
            <section className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Processing locally</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="truncate text-xs text-muted-foreground">{message || "Preparing merge engine..."}</p>
            </section>
          )}

          {outputUrl && (
            <section className="harmony-workspace__result p-4">
              <div className="mb-3 flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Merge complete</p>
                  <p className="mt-0.5 break-all text-xs text-muted-foreground">{outputName} · {formatFileSize(outputSize)}</p>
                </div>
              </div>
              <Button type="button" className="harmony-workspace__action w-full" onClick={downloadOutput}>
                Download merged file
              </Button>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
