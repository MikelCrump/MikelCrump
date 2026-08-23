import { CHANNEL_BY_ID } from '../lib/channels'
import { getFrameSlice } from '../lib/fseq'
import { CHANNEL_COUNT } from '../types'

interface Props {
  frames: Uint8Array
  currentFrame: number
}

const LIGHT_POSITIONS: Record<string, { x: number; y: number; r: number }> = {
  'l-outer-main': { x: 18, y: 28, r: 5 },
  'r-outer-main': { x: 82, y: 28, r: 5 },
  'l-inner-main': { x: 22, y: 32, r: 4 },
  'r-inner-main': { x: 78, y: 32, r: 4 },
  'l-signature': { x: 28, y: 38, r: 3 },
  'r-signature': { x: 72, y: 38, r: 3 },
  'l-front-turn': { x: 12, y: 42, r: 3 },
  'r-front-turn': { x: 88, y: 42, r: 3 },
  'l-front-fog': { x: 20, y: 48, r: 3 },
  'r-front-fog': { x: 80, y: 48, r: 3 },
  'l-side-marker': { x: 8, y: 55, r: 2 },
  'r-side-marker': { x: 92, y: 55, r: 2 },
  'l-brake': { x: 25, y: 72, r: 4 },
  'r-brake': { x: 75, y: 72, r: 4 },
  'l-tail': { x: 22, y: 68, r: 3 },
  'r-tail': { x: 78, y: 68, r: 3 },
  'l-rear-turn': { x: 15, y: 70, r: 3 },
  'r-rear-turn': { x: 85, y: 70, r: 3 },
}

export function CarPreview({ frames, currentFrame }: Props) {
  const slice = getFrameSlice(frames, currentFrame, CHANNEL_COUNT)

  const isOn = (channelId: string) => {
    const ch = CHANNEL_BY_ID.get(channelId)
    if (!ch) return false
    return slice[ch.index] > 127
  }

  const barBrightness = (startIndex: number, count: number) => {
    let sum = 0
    for (let i = 0; i < count; i++) sum += slice[startIndex + i]
    return sum / (count * 255)
  }

  const frontBar = barBrightness(46, 30)
  const rearBar = barBrightness(76, 52)

  return (
    <div className="relative bg-gradient-to-b from-[#0a0a0a] to-[#151515] rounded-xl border border-tesla-border p-4 aspect-[2/1]">
      <p className="text-xs text-gray-500 mb-2 text-center">Model Y Preview — Frame {currentFrame}</p>

      <svg viewBox="0 0 100 90" className="w-full h-full">
        {/* Car body */}
        <ellipse cx="50" cy="50" rx="38" ry="22" fill="#1f1f1f" stroke="#333" strokeWidth="0.5" />
        <rect x="30" y="35" width="40" height="25" rx="8" fill="#252525" stroke="#333" strokeWidth="0.3" />

        {/* Front light bar */}
        <rect x="15" y="22" width="70" height="3" rx="1" fill={`rgba(59,130,246,${frontBar * 0.9})`} />

        {/* Rear light bar */}
        <rect x="18" y="75" width="64" height="3" rx="1" fill={`rgba(232,33,39,${rearBar * 0.9})`} />

        {/* Individual lights */}
        {Object.entries(LIGHT_POSITIONS).map(([id, pos]) => {
          const on = isOn(id)
          const isBrake = id.includes('brake')
          const isTurn = id.includes('turn')
          const color = isBrake ? '#e82127' : isTurn ? '#f59e0b' : '#60a5fa'
          return (
            <circle
              key={id}
              cx={pos.x}
              cy={pos.y}
              r={pos.r}
              fill={on ? color : '#1a1a1a'}
              stroke={on ? color : '#333'}
              strokeWidth="0.5"
              opacity={on ? 1 : 0.3}
              style={{ filter: on ? `drop-shadow(0 0 4px ${color})` : undefined }}
            />
          )
        })}

        {/* Wheels */}
        <circle cx="28" cy="68" r="6" fill="#111" stroke="#333" strokeWidth="0.5" />
        <circle cx="72" cy="68" r="6" fill="#111" stroke="#333" strokeWidth="0.5" />
      </svg>
    </div>
  )
}
