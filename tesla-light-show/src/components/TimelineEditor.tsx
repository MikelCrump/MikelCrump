import { useMemo, useRef, useState } from 'react'
import { EDITABLE_CHANNELS, CHANNEL_GROUPS } from '../lib/channels'
import type { EditorTool, LightEvent } from '../types'
import { STEP_MS } from '../types'

interface Props {
  frameCount: number
  currentFrame: number
  autoEvents: LightEvent[]
  manualEvents: LightEvent[]
  selectedChannelId: string
  editorTool: EditorTool
  showAutoLayer: boolean
  showManualLayer: boolean
  onSelectChannel: (id: string) => void
  onSeek: (frame: number) => void
  onPaint: (channelId: string, startFrame: number, endFrame: number) => void
  onErase: (channelId: string, frame: number) => void
}

const PIXELS_PER_SECOND = 80

export function TimelineEditor({
  frameCount,
  currentFrame,
  autoEvents,
  manualEvents,
  selectedChannelId,
  editorTool,
  showAutoLayer,
  showManualLayer,
  onSelectChannel,
  onSeek,
  onPaint,
  onErase,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [groupFilter, setGroupFilter] = useState<string | 'all'>('all')

  const durationSec = (frameCount * STEP_MS) / 1000
  const width = durationSec * PIXELS_PER_SECOND

  const channels = useMemo(() => {
    if (groupFilter === 'all') return EDITABLE_CHANNELS.slice(0, 30)
    return EDITABLE_CHANNELS.filter((c) => c.group === groupFilter)
  }, [groupFilter])

  const frameToX = (frame: number) => (frame / frameCount) * width
  const xToFrame = (x: number) => Math.floor((x / width) * frameCount)

  const getEventsForChannel = (channelId: string, source: 'auto' | 'manual') => {
    const events = source === 'auto' ? autoEvents : manualEvents
    return events.filter((e) => e.channelId === channelId)
  }

  const handleMouseDown = (channelId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const frame = xToFrame(x)
    onSelectChannel(channelId)

    if (editorTool === 'erase') {
      onErase(channelId, frame)
      return
    }

    setDragStart(frame)
    onSeek(frame)
  }

  const handleMouseUp = (channelId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStart === null || editorTool !== 'paint') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const endFrame = xToFrame(x)
    const start = Math.min(dragStart, endFrame)
    const end = Math.max(dragStart, endFrame) + 1
    if (end - start >= 1) {
      onPaint(channelId, start, Math.max(start + 3, end))
    }
    setDragStart(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Filter:</span>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="text-xs bg-tesla-panel border border-tesla-border rounded px-2 py-1"
        >
          <option value="all">Key Lights</option>
          {CHANNEL_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-600 ml-auto">
          Drag to paint · Click to seek · Min 60ms flash recommended
        </span>
      </div>

      <div className="flex border border-tesla-border rounded-lg overflow-hidden">
        {/* Channel labels */}
        <div className="w-36 shrink-0 bg-tesla-panel border-r border-tesla-border">
          <div className="h-6 border-b border-tesla-border" />
          {channels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => onSelectChannel(ch.id)}
              className={`h-5 px-2 text-[10px] leading-5 truncate cursor-pointer border-b border-tesla-border/50 ${
                selectedChannelId === ch.id ? 'bg-tesla-accent/20 text-tesla-accent' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {ch.name}
            </div>
          ))}
        </div>

        {/* Timeline grid */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
          <div style={{ width }} className="relative">
            {/* Time ruler */}
            <div className="h-6 bg-tesla-panel border-b border-tesla-border relative">
              {Array.from({ length: Math.ceil(durationSec) + 1 }).map((_, s) => (
                <div
                  key={s}
                  className="absolute top-0 h-full border-l border-tesla-border/50 text-[9px] text-gray-600 pl-1"
                  style={{ left: s * PIXELS_PER_SECOND }}
                >
                  {s}s
                </div>
              ))}
              <div
                className="absolute top-0 w-0.5 h-full bg-red-500 z-10 pointer-events-none"
                style={{ left: frameToX(currentFrame) }}
              />
            </div>

            {/* Tracks */}
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="h-5 relative border-b border-tesla-border/30 bg-[#0d0d0d] cursor-crosshair"
                onMouseDown={(e) => handleMouseDown(ch.id, e)}
                onMouseUp={(e) => handleMouseUp(ch.id, e)}
              >
                {showAutoLayer &&
                  getEventsForChannel(ch.id, 'auto').map((ev, i) => (
                    <div
                      key={`a-${i}`}
                      className="absolute top-0.5 bottom-0.5 bg-blue-500/40 rounded-sm pointer-events-none"
                      style={{
                        left: frameToX(ev.startFrame),
                        width: Math.max(2, frameToX(ev.endFrame) - frameToX(ev.startFrame)),
                      }}
                    />
                  ))}
                {showManualLayer &&
                  getEventsForChannel(ch.id, 'manual').map((ev, i) => (
                    <div
                      key={`m-${i}`}
                      className="absolute top-0.5 bottom-0.5 bg-green-500/60 rounded-sm pointer-events-none border border-green-400/50"
                      style={{
                        left: frameToX(ev.startFrame),
                        width: Math.max(2, frameToX(ev.endFrame) - frameToX(ev.startFrame)),
                      }}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
