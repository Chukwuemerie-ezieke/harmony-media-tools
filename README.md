# Harmony Media Tools

A free, privacy-first in-browser media converter and editor by **Harmony Digital Consults Ltd**.

🔗 **Live App:** [https://chukwuemerie-ezieke.github.io/harmony-media-tools/](https://chukwuemerie-ezieke.github.io/harmony-media-tools/)

## Features

- **Format Converter** — Convert between video formats (MP4, WebM, AVI, MKV, MOV, GIF) and audio formats (MP3, WAV, AAC, OGG, FLAC, M4A)
- **Audio Extraction** — Pull audio tracks from any video file
- **Video/Audio Trimming** — Cut files to precise start and end times
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
- GitHub Pages (hosting)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npx vite build
```

The static build outputs to `dist/public/`.

## License

© 2026 Harmony Digital Consults Ltd. All rights reserved.
