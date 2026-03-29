import { useState, useRef, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFFmpeg } from "@/hooks/use-ffmpeg";
import { useTheme } from "@/hooks/use-theme";
import {
  ArrowRightLeft,
  Music,
  Scissors,
  Link2,
  Upload,
  Download,
  FileVideo,
  FileAudio,
  Sun,
  Moon,
  Loader2,
  X,
  Play,
  Info,
  Shield,
} from "lucide-react";

const VIDEO_FORMATS = ["mp4", "webm", "avi", "mkv", "mov", "gif"];
const AUDIO_FORMATS = ["mp3", "wav", "aac", "ogg", "flac", "m4a"];
const ALL_FORMATS = [...VIDEO_FORMATS, ...AUDIO_FORMATS];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function HarmonyLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-label="Harmony Media Tools logo"
    >
      <rect width="40" height="40" rx="10" fill="hsl(270, 60%, 50%)" />
      <path
        d="M12 12v16l7-4v-8l7 4V12l-7 4z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="29" cy="28" r="4" fill="hsl(178, 55%, 45%)" />
      <path
        d="M27.5 27v2.5h3"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { load, loaded, loading, progress, message, convertFile } = useFFmpeg();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("convert");
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("mp4");
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Trim state
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio extract state
  const [audioFormat, setAudioFormat] = useState("mp3");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideoFile = (f: File) => f.type.startsWith("video/");
  const isAudioFile = (f: File) => f.type.startsWith("audio/");
  const isMediaFile = (f: File) => isVideoFile(f) || isAudioFile(f);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      if (!isMediaFile(selectedFile)) {
        toast({
          title: "Unsupported file",
          description: "Please select a video or audio file.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setStartTime(0);
      setEndTime(0);
      setDuration(0);

      // For video files, get duration
      if (isVideoFile(selectedFile)) {
        const url = URL.createObjectURL(selectedFile);
        const v = document.createElement("video");
        v.preload = "metadata";
        v.onloadedmetadata = () => {
          setDuration(v.duration);
          setEndTime(v.duration);
          URL.revokeObjectURL(url);
        };
        v.src = url;
      } else if (isAudioFile(selectedFile)) {
        const url = URL.createObjectURL(selectedFile);
        const a = document.createElement("audio");
        a.preload = "metadata";
        a.onloadedmetadata = () => {
          setDuration(a.duration);
          setEndTime(a.duration);
          URL.revokeObjectURL(url);
        };
        a.src = url;
      }
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleProcess = async () => {
    if (!file) return;

    if (!loaded) {
      await load();
    }

    setProcessing(true);

    try {
      let result: { blob: Blob; filename: string } | null = null;

      if (activeTab === "convert") {
        result = await convertFile(file, outputFormat);
      } else if (activeTab === "extract") {
        result = await convertFile(file, audioFormat, { audioOnly: true });
      } else if (activeTab === "trim") {
        const ext = file.name.split(".").pop() || "mp4";
        result = await convertFile(file, ext, {
          startTime,
          endTime,
        });
      }

      if (result) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "File ready",
          description: `${result.filename} (${formatFileSize(result.blob.size)}) has been downloaded.`,
        });
      }
    } catch {
      toast({
        title: "Processing error",
        description: "Something went wrong. Try a different file or format.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Auto-load FFmpeg on mount
  useEffect(() => {
    load();
  }, [load]);

  const tabConfig = [
    { id: "convert", label: "Convert", icon: ArrowRightLeft },
    { id: "extract", label: "Extract Audio", icon: Music },
    { id: "trim", label: "Trim", icon: Scissors },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HarmonyLogo className="w-8 h-8" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight tracking-tight">
                Harmony Media Tools
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                by Harmony Digital Consults Ltd
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="hidden sm:flex gap-1 text-xs font-normal"
              data-testid="status-badge"
            >
              <Shield className="w-3 h-3" />
              {loaded ? "Engine Ready" : loading ? "Loading..." : "Offline"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              data-testid="button-theme-toggle"
              className="w-8 h-8"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold tracking-tight mb-2">
            Media Converter & Editor
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Convert video and audio formats, extract audio tracks, and trim clips — all
            processed directly in your browser. No uploads, no servers, completely private.
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-6" data-testid="tabs-navigation">
            {tabConfig.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="text-xs sm:text-sm gap-1.5"
                data-testid={`tab-${id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* File Upload Zone - shared across convert/extract/trim tabs */}
          {activeTab !== "about" && (
            <Card className="mb-6 border-dashed border-2 bg-card/50">
              <CardContent className="p-0">
                <div
                  className={`flex flex-col items-center justify-center py-10 px-4 cursor-pointer transition-colors rounded-lg ${
                    dragOver
                      ? "bg-primary/5 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  data-testid="dropzone"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                    data-testid="input-file"
                  />

                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {isVideoFile(file) ? (
                          <FileVideo className="w-6 h-6 text-primary" />
                        ) : (
                          <FileAudio className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium truncate max-w-xs" data-testid="text-filename">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatFileSize(file.size)}
                          {duration > 0 && ` · ${formatTime(duration)}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setDuration(0);
                        }}
                        className="text-xs text-muted-foreground"
                        data-testid="button-remove-file"
                      >
                        <X className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports MP4, WebM, AVI, MKV, MOV, MP3, WAV, AAC, OGG, FLAC
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Convert Tab */}
          <TabsContent value="convert">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Output Format
                    </label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger className="w-full" data-testid="select-output-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          Video
                        </div>
                        {VIDEO_FORMATS.map((f) => (
                          <SelectItem key={f} value={f} data-testid={`option-${f}`}>
                            .{f.toUpperCase()}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-1.5">
                          Audio
                        </div>
                        {AUDIO_FORMATS.map((f) => (
                          <SelectItem key={f} value={f} data-testid={`option-${f}`}>
                            .{f.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleProcess}
                    disabled={!file || processing}
                    className="w-full sm:w-auto"
                    data-testid="button-convert"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                    )}
                    {processing ? "Converting..." : "Convert"}
                  </Button>
                </div>

                {processing && (
                  <div className="mt-4 space-y-2">
                    <Progress value={progress} className="h-2" data-testid="progress-bar" />
                    <p className="text-xs text-muted-foreground truncate" data-testid="text-progress-message">
                      {message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extract Audio Tab */}
          <TabsContent value="extract">
            <Card>
              <CardContent className="p-6">
                {file && !isVideoFile(file) ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Please select a video file to extract audio from.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Audio Format
                      </label>
                      <Select value={audioFormat} onValueChange={setAudioFormat}>
                        <SelectTrigger className="w-full" data-testid="select-audio-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUDIO_FORMATS.map((f) => (
                            <SelectItem key={f} value={f} data-testid={`option-audio-${f}`}>
                              .{f.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleProcess}
                      disabled={!file || processing || (file ? !isVideoFile(file) : true)}
                      className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      data-testid="button-extract"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Music className="w-4 h-4 mr-2" />
                      )}
                      {processing ? "Extracting..." : "Extract Audio"}
                    </Button>
                  </div>
                )}

                {processing && (
                  <div className="mt-4 space-y-2">
                    <Progress value={progress} className="h-2" data-testid="progress-bar-extract" />
                    <p className="text-xs text-muted-foreground truncate">
                      {message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trim Tab */}
          <TabsContent value="trim">
            <Card>
              <CardContent className="p-6">
                {file && duration > 0 ? (
                  <div className="space-y-5">
                    {/* Video Preview */}
                    {isVideoFile(file) && (
                      <div className="rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                        <video
                          ref={videoRef}
                          src={URL.createObjectURL(file)}
                          className="w-full max-h-64 object-contain"
                          controls
                          data-testid="video-preview"
                        />
                      </div>
                    )}

                    {/* Time Range */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Start: {formatTime(startTime)}</span>
                        <span>End: {formatTime(endTime)}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Start Time
                        </label>
                        <Slider
                          value={[startTime]}
                          onValueChange={([v]) => {
                            if (v < endTime) setStartTime(v);
                          }}
                          max={duration}
                          step={0.1}
                          data-testid="slider-start"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          End Time
                        </label>
                        <Slider
                          value={[endTime]}
                          onValueChange={([v]) => {
                            if (v > startTime) setEndTime(v);
                          }}
                          max={duration}
                          step={0.1}
                          data-testid="slider-end"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="font-mono">
                          Duration: {formatTime(endTime - startTime)}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={handleProcess}
                      disabled={processing || startTime >= endTime}
                      className="w-full"
                      data-testid="button-trim"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Scissors className="w-4 h-4 mr-2" />
                      )}
                      {processing ? "Trimming..." : "Trim & Download"}
                    </Button>

                    {processing && (
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" data-testid="progress-bar-trim" />
                        <p className="text-xs text-muted-foreground truncate">
                          {message}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Scissors className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {file
                        ? "Loading file metadata..."
                        : "Upload a video or audio file to trim it"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Privacy First</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        All processing happens directly in your browser using WebAssembly.
                        Your files never leave your device — no uploads, no servers, no tracking.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <ArrowRightLeft className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Format Support</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Convert between MP4, WebM, AVI, MKV, MOV, GIF for video and
                        MP3, WAV, AAC, OGG, FLAC, M4A for audio.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Music className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Audio Extraction</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Pull audio tracks from any video file. Perfect for extracting lecture
                        audio or music from video recordings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Scissors className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Precise Trimming</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Cut video and audio files to exact start and end times.
                        Extract key segments from longer recordings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-3">For Educators & Learners</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Harmony Media Tools was built to help educators and learners save tutorial
                  videos and audio content to their devices for offline access. Instead of
                  relying on constant internet connectivity, you can convert and prepare
                  media files in the formats that work best for your devices.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Use responsibly — only process content you have the rights to use.
                  This tool is designed for personal educational content, Creative Commons
                  materials, and your own recordings.
                </p>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <HarmonyLogo className="w-6 h-6" />
                    <div>
                      <p className="text-xs font-medium">Harmony Digital Consults Ltd</p>
                      <p className="text-[10px] text-muted-foreground">
                        Empowering digital education in Africa
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Harmony Digital Consults Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Processed locally in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
