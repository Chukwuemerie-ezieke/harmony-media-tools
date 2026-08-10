import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const AUDIO_EXTS = ["mp3", "wav", "aac", "ogg", "flac", "m4a"];

const MIME_MAP: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  mov: "video/quicktime",
  gif: "image/gif",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  aac: "audio/aac",
  ogg: "audio/ogg",
  flac: "audio/flac",
  m4a: "audio/mp4",
};

export interface MergeResult {
  blob: Blob;
  filename: string;
}

/**
 * Standalone hook for merging multiple media files into one output using
 * FFmpeg's concat filter. Loads its own isolated FFmpeg/WASM instance so it
 * does not interfere with the primary useFFmpeg() hook used elsewhere in the
 * app.
 */
export function useMergeFiles() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    setMessage("Loading merge engine...");
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      ffmpeg.on("log", ({ message: msg }) => {
        setMessage(msg);
      });
      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      setLoaded(true);
      setMessage("Merge engine ready");
    } catch (err) {
      console.error("Failed to load merge engine:", err);
      setMessage("Failed to load merge engine. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  const mergeFiles = useCallback(
    async (files: File[], outputFormat: string): Promise<MergeResult | null> => {
      if (!loaded) {
        await load();
      }
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg || files.length < 2) return null;

      setProgress(0);
      setMessage("Preparing files for merge...");

      const inputNames: string[] = [];
      try {
        for (let i = 0; i < files.length; i++) {
          const ext = files[i].name.split(".").pop() || "mp4";
          const name = `merge_input_${i}.${ext}`;
          await ffmpeg.writeFile(name, await fetchFile(files[i]));
          inputNames.push(name);
        }

        const isAudioOnly = AUDIO_EXTS.includes(outputFormat);
        const args: string[] = [];
        inputNames.forEach((name) => args.push("-i", name));

        if (isAudioOnly) {
          const filterInputs = inputNames.map((_, i) => `[${i}:a:0]`).join("");
          args.push(
            "-filter_complex",
            `${filterInputs}concat=n=${inputNames.length}:v=0:a=1[outa]`,
            "-map",
            "[outa]"
          );
        } else {
          const filterInputs = inputNames.map((_, i) => `[${i}:v:0][${i}:a:0]`).join("");
          args.push(
            "-filter_complex",
            `${filterInputs}concat=n=${inputNames.length}:v=1:a=1[outv][outa]`,
            "-map",
            "[outv]",
            "-map",
            "[outa]"
          );
        }

        setMessage("Merging files...");
        const outputName = `merged_output.${outputFormat}`;
        args.push("-y", outputName);
        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([(data as Uint8Array).buffer], {
          type: MIME_MAP[outputFormat] || "application/octet-stream",
        });

        for (const name of inputNames) {
          try {
            await ffmpeg.deleteFile(name);
          } catch {
            /* ignore cleanup errors */
          }
        }
        try {
          await ffmpeg.deleteFile(outputName);
        } catch {
          /* ignore cleanup errors */
        }

        setProgress(100);
        setMessage("Merge complete");
        return { blob, filename: `merged-output.${outputFormat}` };
      } catch (err) {
        console.error("Merge error:", err);
        setMessage("Merge failed. Files may have incompatible resolution or codecs.");
        for (const name of inputNames) {
          try {
            await ffmpeg.deleteFile(name);
          } catch {
            /* ignore cleanup errors */
          }
        }
        return null;
      }
    },
    [loaded, load]
  );

  return { load, loaded, loading, progress, message, mergeFiles };
}
