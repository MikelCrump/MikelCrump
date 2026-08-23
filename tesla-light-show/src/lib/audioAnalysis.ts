import { STEP_MS } from '../types'
import type { AudioAnalysis } from '../types'

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer()
  const ctx = new AudioContext({ sampleRate: 44100 })
  try {
    return await ctx.decodeAudioData(arrayBuffer.slice(0))
  } finally {
    await ctx.close()
  }
}

export async function resampleTo44100(buffer: AudioBuffer): Promise<AudioBuffer> {
  if (buffer.sampleRate === 44100) return buffer

  const duration = buffer.duration
  const offline = new OfflineAudioContext(buffer.numberOfChannels, Math.ceil(duration * 44100), 44100)
  const source = offline.createBufferSource()
  source.buffer = buffer
  source.connect(offline.destination)
  source.start(0)
  return offline.startRendering()
}

function getMonoData(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0)

  const length = buffer.length
  const mono = new Float32Array(length)
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) mono[i] += data[i] / buffer.numberOfChannels
  }
  return mono
}

function bandEnergy(samples: Float32Array, start: number, end: number): number {
  let sum = 0
  const len = end - start
  if (len <= 0) return 0
  for (let i = start; i < end; i++) sum += samples[i] * samples[i]
  return Math.sqrt(sum / len)
}

function simpleBandpass(samples: Float32Array, sampleRate: number, lowHz: number, highHz: number): Float32Array {
  const output = new Float32Array(samples.length)
  const rcLow = 1 / (2 * Math.PI * lowHz)
  const rcHigh = 1 / (2 * Math.PI * highHz)
  const dt = 1 / sampleRate
  const alphaLow = dt / (rcLow + dt)
  const alphaHigh = dt / (rcHigh + dt)

  let lowPass = 0
  let highPass = 0
  let prev = 0

  for (let i = 0; i < samples.length; i++) {
    lowPass = lowPass + alphaLow * (samples[i] - lowPass)
    highPass = alphaHigh * (samples[i] - prev)
    prev = samples[i]
    output[i] = lowPass - highPass
  }

  return output
}

export function analyzeAudio(buffer: AudioBuffer): AudioAnalysis {
  const sampleRate = buffer.sampleRate
  const mono = getMonoData(buffer)
  const frameCount = Math.ceil((buffer.duration * 1000) / STEP_MS)
  const samplesPerFrame = Math.floor((STEP_MS / 1000) * sampleRate)

  const bass = new Float32Array(frameCount)
  const mids = new Float32Array(frameCount)
  const highs = new Float32Array(frameCount)
  const energy = new Float32Array(frameCount)

  const bassFiltered = simpleBandpass(mono, sampleRate, 20, 150)
  const midFiltered = simpleBandpass(mono, sampleRate, 150, 2000)
  const highFiltered = simpleBandpass(mono, sampleRate, 2000, 8000)

  for (let f = 0; f < frameCount; f++) {
    const start = f * samplesPerFrame
    const end = Math.min(start + samplesPerFrame, mono.length)
    bass[f] = bandEnergy(bassFiltered, start, end)
    mids[f] = bandEnergy(midFiltered, start, end)
    highs[f] = bandEnergy(highFiltered, start, end)
    energy[f] = bandEnergy(mono, start, end)
  }

  normalizeArray(bass)
  normalizeArray(mids)
  normalizeArray(highs)
  normalizeArray(energy)

  const beats = detectBeats(energy)
  const peaks = detectPeaks(energy, 0.65)

  return {
    duration: buffer.duration,
    frameCount,
    bass,
    mids,
    highs,
    energy,
    beats,
    peaks,
  }
}

function normalizeArray(arr: Float32Array): void {
  let max = 0
  for (let i = 0; i < arr.length; i++) max = Math.max(max, arr[i])
  if (max > 0) {
    for (let i = 0; i < arr.length; i++) arr[i] /= max
  }
}

function detectBeats(energy: Float32Array): number[] {
  const beats: number[] = []
  const threshold = 0.35
  const minGap = Math.floor(150 / STEP_MS)

  let lastBeat = -minGap
  for (let i = 1; i < energy.length - 1; i++) {
    const flux = energy[i] - energy[i - 1]
    if (flux > threshold && energy[i] > 0.4 && i - lastBeat >= minGap) {
      beats.push(i)
      lastBeat = i
    }
  }
  return beats
}

function detectPeaks(energy: Float32Array, threshold: number): number[] {
  const peaks: number[] = []
  for (let i = 2; i < energy.length - 2; i++) {
    if (
      energy[i] > threshold &&
      energy[i] >= energy[i - 1] &&
      energy[i] >= energy[i + 1] &&
      energy[i] > energy[i - 2] &&
      energy[i] > energy[i + 2]
    ) {
      peaks.push(i)
    }
  }
  return peaks
}

export function getWaveformPeaks(buffer: AudioBuffer, points = 2000): Float32Array {
  const mono = getMonoData(buffer)
  const blockSize = Math.floor(mono.length / points)
  const peaks = new Float32Array(points)

  for (let i = 0; i < points; i++) {
    const start = i * blockSize
    let max = 0
    for (let j = start; j < start + blockSize && j < mono.length; j++) {
      max = Math.max(max, Math.abs(mono[j]))
    }
    peaks[i] = max
  }
  return peaks
}
