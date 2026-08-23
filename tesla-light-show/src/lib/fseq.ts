import { CHANNEL_COUNT, STEP_MS } from '../types'

const HEADER_SIZE = 28

export interface FseqInfo {
  channelCount: number
  frameCount: number
  stepTime: number
  durationMs: number
}

export function createEmptyFrames(frameCount: number, channelCount = CHANNEL_COUNT): Uint8Array {
  return new Uint8Array(frameCount * channelCount)
}

export function getFrameSlice(frames: Uint8Array, frameIndex: number, channelCount = CHANNEL_COUNT): Uint8Array {
  const start = frameIndex * channelCount
  return frames.subarray(start, start + channelCount)
}

export function setChannelValue(
  frames: Uint8Array,
  frameIndex: number,
  channelIndex: number,
  value: number,
  channelCount = CHANNEL_COUNT,
): void {
  frames[frameIndex * channelCount + channelIndex] = Math.max(0, Math.min(255, Math.round(value)))
}

export function encodeFseq(frames: Uint8Array, frameCount: number, channelCount = CHANNEL_COUNT, stepTime = STEP_MS): ArrayBuffer {
  const header = new ArrayBuffer(HEADER_SIZE)
  const view = new DataView(header)
  const magic = new TextEncoder().encode('PSEQ')
  new Uint8Array(header, 0, 4).set(magic)

  view.setUint16(4, HEADER_SIZE, true)
  view.setUint8(6, 2) // minor version
  view.setUint8(7, 2) // major version
  view.setUint32(10, channelCount, true)
  view.setUint32(14, frameCount, true)
  view.setUint8(18, stepTime)
  view.setUint8(20, 0) // uncompressed

  const body = new Uint8Array(frameCount * channelCount)
  body.set(frames.subarray(0, frameCount * channelCount))

  const result = new Uint8Array(HEADER_SIZE + body.length)
  result.set(new Uint8Array(header), 0)
  result.set(body, HEADER_SIZE)
  return result.buffer
}

export function decodeFseq(buffer: ArrayBuffer): { info: FseqInfo; frames: Uint8Array } {
  const view = new DataView(buffer)
  const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))
  if (magic !== 'PSEQ') throw new Error('Not a valid FSEQ file')

  const dataOffset = view.getUint16(4, true)
  const channelCount = view.getUint32(10, true)
  const frameCount = view.getUint32(14, true)
  const stepTime = view.getUint8(18)
  const compression = view.getUint8(20)

  if (compression !== 0) throw new Error('Only uncompressed FSEQ files are supported')

  const frames = new Uint8Array(buffer, dataOffset, frameCount * channelCount)
  return {
    info: {
      channelCount,
      frameCount,
      stepTime,
      durationMs: frameCount * stepTime,
    },
    frames: new Uint8Array(frames),
  }
}

export function framesFromEvents(
  frameCount: number,
  events: Array<{ channelIndex: number; startFrame: number; endFrame: number; value: number }>,
  channelCount = CHANNEL_COUNT,
): Uint8Array {
  const frames = createEmptyFrames(frameCount, channelCount)
  for (const event of events) {
    for (let f = event.startFrame; f < Math.min(event.endFrame, frameCount); f++) {
      setChannelValue(frames, f, event.channelIndex, event.value, channelCount)
    }
  }
  return frames
}

export function mergeFrames(base: Uint8Array, overlay: Uint8Array): Uint8Array {
  const result = new Uint8Array(base.length)
  for (let i = 0; i < base.length; i++) {
    result[i] = overlay[i] > 0 ? overlay[i] : base[i]
  }
  return result
}

export function applyOffsetFrames(frames: Uint8Array, offsetFrames: number, channelCount = CHANNEL_COUNT): Uint8Array {
  if (offsetFrames === 0) return frames
  const frameCount = frames.length / channelCount
  const result = createEmptyFrames(frameCount, channelCount)

  if (offsetFrames > 0) {
    const copyLen = Math.min(frameCount - offsetFrames, frameCount) * channelCount
    result.set(frames.subarray(0, copyLen), offsetFrames * channelCount)
  } else {
    const shift = -offsetFrames
    const copyLen = Math.min(frameCount - shift, frameCount) * channelCount
    result.set(frames.subarray(shift * channelCount, shift * channelCount + copyLen), 0)
  }

  return result
}
