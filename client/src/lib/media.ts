export function getMediaMetadata(file: File): Promise<{ duration: number; width?: number; height?: number }> {
  return new Promise((resolve, reject) => {
    const isVideo = file.type.startsWith("video/");
    const media = isVideo ? document.createElement("video") : document.createElement("audio");

    const url = URL.createObjectURL(file);
    media.src = url;

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (isVideo) {
        resolve({
          duration: media.duration,
          width: (media as HTMLVideoElement).videoWidth,
          height: (media as HTMLVideoElement).videoHeight,
        });
      } else {
        resolve({
          duration: media.duration,
        });
      }
    };

    media.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load media metadata"));
    };
  });
}
