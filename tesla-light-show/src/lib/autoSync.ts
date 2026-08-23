import { CHANNEL_BY_ID } from './channels'
import { framesFromEvents } from './fseq'
import type { AudioAnalysis, LightEvent, SyncSettings } from '../types'
import { CHANNEL_COUNT, STEP_MS } from '../types'

const ON = 255
const MIN_FLASH_FRAMES = 5 // 100ms at 20ms/frame

export function generateAutoSync(
  analysis: AudioAnalysis,
  settings: SyncSettings,
): { events: LightEvent[]; frames: Uint8Array } {
  const events: LightEvent[] = []
  const { frameCount, bass, mids, highs, energy, beats } = analysis
  const offsetFrames = Math.round(settings.autoOffsetMs / STEP_MS)

  const bassThreshold = 0.55 - settings.bassSensitivity * 0.25
  const beatThreshold = 0.45 - settings.beatSensitivity * 0.2
  const flashFrames = Math.max(MIN_FLASH_FRAMES, Math.round(5 * settings.intensity))

  for (let f = 0; f < frameCount; f++) {
    const isBeat = beats.includes(f)
    const bassHit = bass[f] > bassThreshold
    const midHit = mids[f] > 0.5
    const highHit = highs[f] > 0.45
    const bigHit = energy[f] > beatThreshold && (isBeat || bassHit)

    if (settings.useHeadlights && (bassHit || bigHit)) {
      const end = f + flashFrames
      events.push(event('l-outer-main', f, end))
      events.push(event('r-outer-main', f, end))
      if (bigHit) {
        events.push(event('l-inner-main', f, end))
        events.push(event('r-inner-main', f, end))
      }
    }

    if (settings.useBrakeLights && (bassHit || isBeat)) {
      events.push(event('l-brake', f, f + flashFrames))
      events.push(event('r-brake', f, f + flashFrames))
      events.push(event('l-tail', f, f + flashFrames))
      events.push(event('r-tail', f, f + flashFrames))
    }

    if (settings.useSignature && (midHit || highHit)) {
      const sigLen = Math.round(flashFrames * 1.5)
      events.push(event('l-signature', f, f + sigLen))
      events.push(event('r-signature', f, f + sigLen))
    }

    if (settings.useTurnSignals && (midHit || isBeat)) {
      const side = settings.alternateSides ? (f % 2 === 0 ? 'l' : 'r') : isBeat && f % 4 < 2 ? 'l' : 'r'
      events.push(event(`${side}-front-turn`, f, f + flashFrames))
      events.push(event(`${side}-rear-turn`, f, f + flashFrames))
    }

    if (settings.useSideMarkers && highHit) {
      events.push(event('l-side-marker', f, f + Math.max(3, flashFrames - 2)))
      events.push(event('r-side-marker', f, f + Math.max(3, flashFrames - 2)))
      events.push(event('l-aux-park', f, f + Math.max(3, flashFrames - 2)))
      events.push(event('r-aux-park', f, f + Math.max(3, flashFrames - 2)))
    }
  }

  // Light bar sweep on beat drops
  for (const beat of beats) {
    if (energy[beat] > 0.7) {
      addLightBarPulse(events, beat, flashFrames * 2, settings.intensity)
    }
  }

  const channelEvents = events.map((e) => ({
    channelIndex: CHANNEL_BY_ID.get(e.channelId)!.index,
    startFrame: Math.max(0, e.startFrame + offsetFrames),
    endFrame: Math.min(frameCount, e.endFrame + offsetFrames),
    value: e.value,
  }))

  const frames = framesFromEvents(frameCount, channelEvents, CHANNEL_COUNT)
  return { events, frames }
}

function event(channelId: string, start: number, end: number, value = ON): LightEvent {
  return { channelId, startFrame: start, endFrame: end, value }
}

function addLightBarPulse(events: LightEvent[], startFrame: number, duration: number, intensity: number): void {
  const brightness = Math.round(180 + intensity * 75)
  const barLen = 30

  for (let i = 0; i < barLen; i++) {
    const offset = Math.floor((i / barLen) * duration)
    const ledStart = startFrame + offset
    const ledEnd = ledStart + Math.max(3, Math.floor(duration / 4))
    events.push(event(`front-bar-${i}`, ledStart, ledEnd, brightness))
  }

  for (let i = 0; i < 52; i++) {
    const offset = Math.floor((i / 52) * duration)
    const ledStart = startFrame + offset
    const ledEnd = ledStart + Math.max(3, Math.floor(duration / 5))
    events.push(event(`rear-bar-${i}`, ledStart, ledEnd, brightness))
  }
}

export function eventsToFrames(events: LightEvent[], frameCount: number): Uint8Array {
  const channelEvents = events.map((e) => ({
    channelIndex: CHANNEL_BY_ID.get(e.channelId)!.index,
    startFrame: e.startFrame,
    endFrame: e.endFrame,
    value: e.value,
  }))
  return framesFromEvents(frameCount, channelEvents, CHANNEL_COUNT)
}

export function applyManualOverrides(
  autoFrames: Uint8Array,
  manualEvents: LightEvent[],
  globalOffsetMs: number,
  frameCount: number,
): Uint8Array {
  const offsetFrames = Math.round(globalOffsetMs / STEP_MS)
  const adjusted = manualEvents.map((e) => ({
    ...e,
    startFrame: e.startFrame + offsetFrames,
    endFrame: e.endFrame + offsetFrames,
  }))

  const manualFrames = eventsToFrames(adjusted, frameCount)
  const merged = new Uint8Array(autoFrames.length)
  for (let i = 0; i < merged.length; i++) {
    merged[i] = manualFrames[i] > 0 ? manualFrames[i] : autoFrames[i]
  }
  return merged
}

export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  intensity: 0.7,
  bassSensitivity: 0.5,
  beatSensitivity: 0.5,
  autoOffsetMs: 0,
  useHeadlights: true,
  useBrakeLights: true,
  useTurnSignals: true,
  useSideMarkers: true,
  useSignature: true,
  alternateSides: true,
}
