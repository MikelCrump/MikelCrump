import { useCallback, useRef, useState } from 'react'
import { analyzeAudio, decodeAudioFile, getWaveformPeaks, resampleTo44100 } from '../lib/audioAnalysis'
import { applyManualOverrides, DEFAULT_SYNC_SETTINGS, generateAutoSync } from '../lib/autoSync'
import type { AudioAnalysis, EditorTool, LightEvent, ManualOverrides, SyncSettings } from '../types'
import { STEP_MS } from '../types'

export function useLightShow() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [waveform, setWaveform] = useState<Float32Array | null>(null)
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null)
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(DEFAULT_SYNC_SETTINGS)
  const [autoEvents, setAutoEvents] = useState<LightEvent[]>([])
  const [autoFrames, setAutoFrames] = useState<Uint8Array | null>(null)
  const [manualOverrides, setManualOverrides] = useState<ManualOverrides>({ globalOffsetMs: 0, events: [] })
  const [mergedFrames, setMergedFrames] = useState<Uint8Array | null>(null)
  const [showName, setShowName] = useState('my_lightshow')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedChannelId, setSelectedChannelId] = useState<string>('l-brake')
  const [editorTool, setEditorTool] = useState<EditorTool>('paint')
  const [showManualLayer, setShowManualLayer] = useState(true)
  const [showAutoLayer, setShowAutoLayer] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef<number>(0)

  const loadAudio = useCallback(async (file: File) => {
    setError(null)
    setIsAnalyzing(true)
    try {
      const decoded = await decodeAudioFile(file)
      const resampled = await resampleTo44100(decoded)
      const peaks = getWaveformPeaks(resampled)
      const audioAnalysis = analyzeAudio(resampled)

      setAudioFile(file)
      setAudioBuffer(resampled)
      setWaveform(peaks)
      setAnalysis(audioAnalysis)
      setShowName(file.name.replace(/\.[^.]+$/, ''))

      const { events, frames } = generateAutoSync(audioAnalysis, DEFAULT_SYNC_SETTINGS)
      setAutoEvents(events)
      setAutoFrames(frames)
      setMergedFrames(frames)
      setManualOverrides({ globalOffsetMs: 0, events: [] })
      setCurrentFrame(0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audio')
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const regenerateAutoSync = useCallback(() => {
    if (!analysis) return
    const { events, frames } = generateAutoSync(analysis, syncSettings)
    setAutoEvents(events)
    setAutoFrames(frames)
    const merged = applyManualOverrides(frames, manualOverrides.events, manualOverrides.globalOffsetMs, analysis.frameCount)
    setMergedFrames(merged)
  }, [analysis, syncSettings, manualOverrides])

  const updateSyncSettings = useCallback(
    (patch: Partial<SyncSettings>) => {
      setSyncSettings((prev) => {
        const next = { ...prev, ...patch }
        if (analysis) {
          const { events, frames } = generateAutoSync(analysis, next)
          setAutoEvents(events)
          setAutoFrames(frames)
          const merged = applyManualOverrides(frames, manualOverrides.events, manualOverrides.globalOffsetMs, analysis.frameCount)
          setMergedFrames(merged)
        }
        return next
      })
    },
    [analysis, manualOverrides],
  )

  const updateGlobalOffset = useCallback(
    (offsetMs: number) => {
      if (!analysis || !autoFrames) return
      setManualOverrides((prev) => {
        const next = { ...prev, globalOffsetMs: offsetMs }
        const merged = applyManualOverrides(autoFrames, next.events, next.globalOffsetMs, analysis.frameCount)
        setMergedFrames(merged)
        return next
      })
    },
    [analysis, autoFrames],
  )

  const addManualEvent = useCallback(
    (event: LightEvent) => {
      if (!analysis || !autoFrames) return
      setManualOverrides((prev) => {
        const next = { ...prev, events: [...prev.events, event] }
        const merged = applyManualOverrides(autoFrames, next.events, next.globalOffsetMs, analysis.frameCount)
        setMergedFrames(merged)
        return next
      })
    },
    [analysis, autoFrames],
  )

  const removeManualEventsAt = useCallback(
    (channelId: string, frame: number) => {
      if (!analysis || !autoFrames) return
      setManualOverrides((prev) => {
        const next = {
          ...prev,
          events: prev.events.filter((e) => !(e.channelId === channelId && frame >= e.startFrame && frame < e.endFrame)),
        }
        const merged = applyManualOverrides(autoFrames, next.events, next.globalOffsetMs, analysis.frameCount)
        setMergedFrames(merged)
        return next
      })
    },
    [analysis, autoFrames],
  )

  const clearManualEvents = useCallback(() => {
    if (!analysis || !autoFrames) return
    setManualOverrides({ globalOffsetMs: 0, events: [] })
    setMergedFrames(autoFrames)
  }, [analysis, autoFrames])

  const play = useCallback(() => {
    if (!audioRef.current || !analysis) return
    audioRef.current.currentTime = currentFrame * (STEP_MS / 1000)
    audioRef.current.play()
    setIsPlaying(true)

    const tick = () => {
      if (!audioRef.current) return
      const frame = Math.floor((audioRef.current.currentTime * 1000) / STEP_MS)
      setCurrentFrame(Math.min(frame, analysis.frameCount - 1))
      if (!audioRef.current.paused) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [analysis, currentFrame])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    cancelAnimationFrame(rafRef.current)
    setIsPlaying(false)
  }, [])

  const seek = useCallback(
    (frame: number) => {
      if (!analysis) return
      const clamped = Math.max(0, Math.min(frame, analysis.frameCount - 1))
      setCurrentFrame(clamped)
      if (audioRef.current) {
        audioRef.current.currentTime = clamped * (STEP_MS / 1000)
      }
    },
    [analysis],
  )

  const setAudioElement = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el
  }, [])

  return {
    audioFile,
    audioBuffer,
    waveform,
    analysis,
    syncSettings,
    autoEvents,
    autoFrames,
    manualOverrides,
    mergedFrames,
    showName,
    setShowName,
    isAnalyzing,
    error,
    currentFrame,
    isPlaying,
    selectedChannelId,
    setSelectedChannelId,
    editorTool,
    setEditorTool,
    showManualLayer,
    setShowManualLayer,
    showAutoLayer,
    setShowAutoLayer,
    loadAudio,
    regenerateAutoSync,
    updateSyncSettings,
    updateGlobalOffset,
    addManualEvent,
    removeManualEventsAt,
    clearManualEvents,
    play,
    pause,
    seek,
    setAudioElement,
  }
}

export type LightShowState = ReturnType<typeof useLightShow>
