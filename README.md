# Tesla Light Show Studio

A web app for creating custom Tesla Model Y (2025/2026 Juniper) light shows. Upload music, auto-sync lights to the beat, manually fine-tune timing, QA preview, and export a USB-ready `LightShow` folder.

## Features

- **Music upload** — MP3 or WAV (44.1 kHz recommended)
- **Auto sync** — Analyzes bass, beats, and energy to generate light patterns
- **Manual editor** — Paint/erase on a timeline to fix sync issues
- **Global offset** — Shift all manual overrides ±500ms
- **QA playback** — Play audio with live car preview and scrubbable timeline
- **USB export** — Validated FSEQ v2 uncompressed (200 channels, 20ms frames) + audio in a `LightShow` zip

## Quick Start

```bash
cd tesla-light-show
npm install
npm run dev
```

Open http://localhost:5173

## Using in Your Car

1. Export the ZIP and unzip it
2. Copy the `LightShow` folder to the root of a USB drive (exFAT or FAT32)
3. Insert USB into your Model Y (front USB or glovebox)
4. Go to **Toybox → Light Show → Schedule Show**
5. Select your custom show from the dropdown

## Model Compatibility

Configured for **Model Y Juniper** (2025/2026 refresh) with 200 FSEQ channels. Shows use the Tesla-standard format and should work on other supported vehicles, though channel mapping may differ on older models (48-channel).

## Tech Stack

- React + TypeScript + Vite
- Web Audio API for beat/bass analysis
- Custom FSEQ encoder (validated with `@xsor/tlsv`)
- Tailwind CSS
