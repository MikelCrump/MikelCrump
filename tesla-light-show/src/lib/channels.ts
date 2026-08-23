import type { ChannelDef } from '../types'

/** Model Y Juniper (2025+) — 200-channel map (0-indexed internally). */
export const CHANNELS: ChannelDef[] = [
  // Exterior headlights & signature (ch 1–17)
  { id: 'l-outer-main', name: 'L Outer Main Beam', index: 0, type: 'boolean', group: 'Headlights', side: 'left' },
  { id: 'r-outer-main', name: 'R Outer Main Beam', index: 1, type: 'boolean', group: 'Headlights', side: 'right' },
  { id: 'l-inner-main', name: 'L Inner Main Beam', index: 2, type: 'boolean', group: 'Headlights', side: 'left' },
  { id: 'r-inner-main', name: 'R Inner Main Beam', index: 3, type: 'boolean', group: 'Headlights', side: 'right' },
  { id: 'l-signature', name: 'L Signature', index: 4, type: 'boolean', group: 'Signature', side: 'left' },
  { id: 'r-signature', name: 'R Signature', index: 5, type: 'boolean', group: 'Signature', side: 'right' },
  { id: 'ch4', name: 'Channel 4', index: 6, type: 'boolean', group: 'Channels 4-6', side: 'left' },
  { id: 'ch5', name: 'Channel 5', index: 7, type: 'boolean', group: 'Channels 4-6', side: 'center' },
  { id: 'ch6', name: 'Channel 6', index: 8, type: 'boolean', group: 'Channels 4-6', side: 'right' },
  { id: 'l-front-turn', name: 'L Front Turn', index: 9, type: 'boolean', group: 'Front Turn', side: 'left' },
  { id: 'r-front-turn', name: 'R Front Turn', index: 10, type: 'boolean', group: 'Front Turn', side: 'right' },
  { id: 'l-front-fog', name: 'L Front Fog', index: 11, type: 'boolean', group: 'Fog', side: 'left' },
  { id: 'r-front-fog', name: 'R Front Fog', index: 12, type: 'boolean', group: 'Fog', side: 'right' },
  { id: 'l-aux-park', name: 'L Aux Park', index: 13, type: 'boolean', group: 'Park/Marker', side: 'left' },
  { id: 'r-aux-park', name: 'R Aux Park', index: 14, type: 'boolean', group: 'Park/Marker', side: 'right' },
  { id: 'l-side-marker', name: 'L Side Marker', index: 15, type: 'boolean', group: 'Park/Marker', side: 'left' },
  { id: 'r-side-marker', name: 'R Side Marker', index: 16, type: 'boolean', group: 'Park/Marker', side: 'right' },

  // Rear lights (ch 18–30)
  { id: 'l-tail', name: 'L Tail', index: 17, type: 'boolean', group: 'Rear', side: 'left' },
  { id: 'r-tail', name: 'R Tail', index: 18, type: 'boolean', group: 'Rear', side: 'right' },
  { id: 'l-brake', name: 'L Brake', index: 19, type: 'boolean', group: 'Rear', side: 'left' },
  { id: 'r-brake', name: 'R Brake', index: 20, type: 'boolean', group: 'Rear', side: 'right' },
  { id: 'l-rear-turn', name: 'L Rear Turn', index: 21, type: 'boolean', group: 'Rear Turn', side: 'left' },
  { id: 'r-rear-turn', name: 'R Rear Turn', index: 22, type: 'boolean', group: 'Rear Turn', side: 'right' },
  { id: 'l-reverse', name: 'L Reverse', index: 23, type: 'boolean', group: 'Rear', side: 'left' },
  { id: 'r-reverse', name: 'R Reverse', index: 24, type: 'boolean', group: 'Rear', side: 'right' },
  { id: 'license', name: 'License Plate', index: 25, type: 'boolean', group: 'Rear', side: 'center' },
  { id: 'l-rear-fog', name: 'L Rear Fog', index: 26, type: 'boolean', group: 'Rear', side: 'left' },
  { id: 'r-rear-fog', name: 'R Rear Fog', index: 27, type: 'boolean', group: 'Rear', side: 'right' },
  { id: 'l-repeater', name: 'L Side Repeater', index: 28, type: 'boolean', group: 'Park/Marker', side: 'left' },
  { id: 'r-repeater', name: 'R Side Repeater', index: 29, type: 'boolean', group: 'Park/Marker', side: 'right' },

  // Closures (ch 31–46 → index 30–45)
  { id: 'liftgate', name: 'Liftgate', index: 30, type: 'closure', group: 'Closures', side: 'center' },
  { id: 'l-mirror', name: 'L Mirror', index: 31, type: 'closure', group: 'Closures', side: 'left' },
  { id: 'r-mirror', name: 'R Mirror', index: 32, type: 'closure', group: 'Closures', side: 'right' },
  { id: 'charge-port', name: 'Charge Port', index: 33, type: 'closure', group: 'Closures', side: 'center' },
  { id: 'l-window', name: 'L Window', index: 34, type: 'closure', group: 'Closures', side: 'left' },
  { id: 'r-window', name: 'R Window', index: 35, type: 'closure', group: 'Closures', side: 'right' },

  // Front light bar LEDs (ch 47–76, 30 LEDs)
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `front-bar-${i}`,
    name: `Front Bar LED ${i + 1}`,
    index: 46 + i,
    type: 'brightness' as const,
    group: 'Front Light Bar',
    side: (i < 10 ? 'left' : i < 20 ? 'center' : 'right') as 'left' | 'center' | 'right',
  })),

  // Rear light bar LEDs (ch 77–128, 52 LEDs)
  ...Array.from({ length: 52 }, (_, i) => ({
    id: `rear-bar-${i}`,
    name: `Rear Bar LED ${i + 1}`,
    index: 76 + i,
    type: 'brightness' as const,
    group: 'Rear Light Bar',
    side: (i < 17 ? 'left' : i < 35 ? 'center' : 'right') as 'left' | 'center' | 'right',
  })),
]

export const CHANNEL_BY_ID = new Map(CHANNELS.map((c) => [c.id, c]))
export const EDITABLE_CHANNELS = CHANNELS.filter((c) => c.type !== 'closure')
export const CHANNEL_GROUPS = [...new Set(CHANNELS.map((c) => c.group))]

export const CLOSURE_VALUES = {
  idle: 0,
  open: 64,
  dance: 128,
  close: 192,
  stop: 255,
} as const

export function getChannelIndex(channelId: string): number {
  const ch = CHANNEL_BY_ID.get(channelId)
  if (!ch) throw new Error(`Unknown channel: ${channelId}`)
  return ch.index
}
