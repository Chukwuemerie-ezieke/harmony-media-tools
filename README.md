# Harmony Media Tools

A free, privacy-first in-browser media converter and editor by **Harmony Digital Consults Ltd**.

🔗 **Live App:** [https://chukwuemerie-ezieke.github.io/harmony-media-tools/](https://chukwuemerie-ezieke.github.io/harmony-media-tools/)

## Features

- **Format Converter** — Convert between video formats (MP4, WebM, AVI, MKV, MOV, GIF) and audio formats (MP3, WAV, AAC, OGG, FLAC, M4A)
- **Video Compression** — Resize resolution and lower CRF to reduce file sizes
- **Crop & Rotate** — 1:1, 16:9, 9:16 aspect ratio presets and 90/180-degree rotations
- **Audio Extraction** — Pull audio tracks from any video file
- **Video/Audio Trimming** — Cut files to precise start and end times
- **Audio FX** — Boost volume (up to 200%) and apply 2s fade-ins/fade-outs
- **GIF Maker** — Convert video to GIF with customizable framerate
- **File Merging** — Concatenate multiple media files of similar codecs together
- **Progressive Web App (PWA)** — Installable to desktop/mobile and works completely offline
- **Dark/Light Theme** — Automatic system detection with manual toggle

## Privacy & Security

All media processing runs entirely in your browser using [FFmpeg WebAssembly](https://ffmpegwasm.netlify.app/). **Your files never leave your device** — there are no server uploads, no tracking, and no data collection.

## For Educators & Learners

This tool was built to help educators and learners save tutorial videos and audio content to their devices for offline access. Instead of relying on constant internet connectivity, you can convert and prepare media files in the formats that work best for your devices.

**Use responsibly** — only process content you have the rights to use. This tool is designed for personal educational content, Creative Commons materials, and your own recordings.

## Tech Stack

- React + TypeScript
- Tailwind CSS + shadcn/ui
- FFmpeg WASM (in-browser media processing)
- Vite (build tool)

## Development

npm install
npm run dev

## Build

npm run build

The static build outputs to `dist/`.

## Deployment Recommendations

The app is built as a pure static site relying heavily on FFmpeg WASM. FFmpeg WASM requires `SharedArrayBuffer` support, which requires specific security headers:
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

**Netlify / Vercel / Render**
For the best experience, we recommend deploying to a provider like **Netlify**, **Vercel**, or **Render Static Sites**. These platforms allow you to easily set custom HTTP response headers via a configuration file (e.g. `netlify.toml` or `vercel.json`) to enable FFmpeg WASM without any issues.

*Example `vercel.json`:*
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

**GitHub Pages**
Deploying to GitHub Pages requires a workaround for the required HTTP headers, typically by using a Service Worker like `coi-serviceworker` since GitHub Pages does not allow custom HTTP headers. Note that using service worker workarounds can sometimes result in slower first-time loads or caching issues.

## License

© 2026 Harmony Digital Consults Ltd. All rights reserved.