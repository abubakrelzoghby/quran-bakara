---
name: audio-playback-sync
description: Design or modify Quran audio playback, ayah timing, highlighting, reciter metadata, and resume behavior. Use when the user mentions audio, playback, recitation, ayah sync, or listening progress.
paths:
  - "assets/js/**/*.js"
  - "assets/css/**/*.css"
  - "api/**/*.php"
  - "api/**/*.json"
---

# Audio Playback Sync

## Instructions

1. Confirm the audio source, reciter, and timing metadata format before implementing.
2. Keep ayah timing data separate from `api/data.json` unless the schedule model explicitly changes.
3. Use canonical ayah numbers for sync and highlighting; never parse timing from display text.
4. Keep playback progress separate from completion keys like `person__weekN-dayD`.
5. Handle missing timing data, failed audio loads, and browser autoplay restrictions gracefully.
6. Keep implementation browser-native and shared-hosting friendly; do not add a build pipeline or audio processing dependency unless approved.

## Verification

- Playback controls are usable in RTL layout.
- Highlighted ayah range matches the selected schedule part.
- Resume state does not mark reading completion automatically.
- Audio failure leaves the reading schedule usable.
