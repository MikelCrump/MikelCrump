import { useCallback, useRef } from 'react'
import { STEP_MS } from '../types'

interface Props {
  waveform: Float32Array
  frameCount: number
  currentFrame: number
  beats: number[]
  onSeek: (frame: number) => void
  isPlaying: boolean
}

export function WaveformView({ waveform, frameCount, currentFrame, beats, onSeek, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const width = container.clientWidth
    const height = 80
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, width, height)

    // Waveform
    const barWidth = width / waveform.length
    ctx.fillStyle = '#3b82f6'
    for (let i = 0; i < waveform.length; i++) {
      const h = waveform[i] * height * 0.8
      ctx.fillRect(i * barWidth, (height - h) / 2, Math.max(1, barWidth - 0.5), h)
    }

    // Beat markers
    const beatSet = new Set(beats)
    ctx.fillStyle = 'rgba(232, 33, 39, 0.6)'
    for (let f = 0; f < frameCount; f++) {
      if (beatSet.has(f)) {
        const x = (f / frameCount) * width
        ctx.fillRect(x, 0, 1, height)
      }
    }

    // Playhead
    const playX = (currentFrame / frameCount) * width
    ctx.strokeStyle = isPlaying ? '#e82127' : '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(playX, 0)
    ctx.lineTo(playX, height)
    ctx.stroke()
  }, [waveform, frameCount, currentFrame, beats, isPlaying])

  // Redraw on changes
  useRef(draw).current = draw
  draw()

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const frame = Math.floor((x / rect.width) * frameCount)
    onSeek(frame)
  }

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden border border-tesla-border">
      <canvas ref={canvasRef} onClick={handleClick} className="w-full cursor-crosshair" />
      <div className="flex justify-between px-2 py-1 text-xs text-gray-500 bg-tesla-panel">
        <span>{formatTime(currentFrame * STEP_MS)}</span>
        <span>{formatTime(frameCount * STEP_MS)}</span>
      </div>
    </div>
  )
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${rem.toString().padStart(2, '0')}`
}
