export const STEP_MS = 20
export const CHANNEL_COUNT = 200
export const MAX_DURATION_MS = 4 * 60 * 60 * 1000

export type ChannelType = 'boolean' | 'brightness' | 'closure'

export interface ChannelDef {
  id: string
  name: string
  index: number
  type: ChannelType
  group: string
  side?: 'left' | 'right' | 'center'
}

export interface LightEvent {
  channelId: string
  startFrame: number
  endFrame: number
  value: number
}

export interface AudioAnalysis {
  duration: number
  frameCount: number
  bass: Float32Array
  mids: Float32Array
  highs: Float32Array
  energy: Float32Array
  beats: number[]
  peaks: number[]
}

export interface SyncSettings {
  intensity: number
  bassSensitivity: number
  beatSensitivity: number
  autoOffsetMs: number
  useHeadlights: boolean
  useBrakeLights: boolean
  useTurnSignals: boolean
  useSideMarkers: boolean
  useSignature: boolean
  alternateSides: boolean
}

export interface ManualOverrides {
  globalOffsetMs: number
  events: LightEvent[]
}

export type EditorTool = 'select' | 'paint' | 'erase'
