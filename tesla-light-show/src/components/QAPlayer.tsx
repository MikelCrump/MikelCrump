import { Play, Pause, SkipBack, SkipForward, Brush, Eraser, MousePointer, Eye, EyeOff } from 'lucide-react'
import type { EditorTool } from '../types'
import { STEP_MS } from '../types'

interface Props {
  isPlaying: boolean
  currentFrame: number
  frameCount: number
  editorTool: EditorTool
  showAutoLayer: boolean
  showManualLayer: boolean
  onPlay: () => void
  onPause: () => void
  onSeek: (frame: number) => void
  onToolChange: (tool: EditorTool) => void
  onToggleAutoLayer: () => void
  onToggleManualLayer: () => void
  onClearManual: () => void
}

export function QAPlayer({
  isPlaying,
  currentFrame,
  frameCount,
  editorTool,
  showAutoLayer,
  showManualLayer,
  onPlay,
  onPause,
  onSeek,
  onToolChange,
  onToggleAutoLayer,
  onToggleManualLayer,
  onClearManual,
}: Props) {
  const step = (delta: number) => onSeek(Math.max(0, Math.min(frameCount - 1, currentFrame + delta)))

  return (
    <div className="bg-tesla-panel rounded-xl border border-tesla-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">QA Playback & Manual Edit</h3>
        <span className="text-xs text-gray-500">
          {formatTime(currentFrame * STEP_MS)} / {formatTime(frameCount * STEP_MS)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => step(-25)} className="p-2 rounded-lg hover:bg-white/5" title="Back 0.5s">
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-3 rounded-full bg-tesla-red hover:bg-red-600 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button onClick={() => step(25)} className="p-2 rounded-lg hover:bg-white/5" title="Forward 0.5s">
          <SkipForward className="w-4 h-4" />
        </button>

        <input
          type="range"
          min={0}
          max={frameCount - 1}
          value={currentFrame}
          onChange={(e) => onSeek(parseInt(e.target.value))}
          className="flex-1 mx-2 accent-tesla-red"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Tool:</span>
        {(
          [
            ['select', MousePointer, 'Select'],
            ['paint', Brush, 'Paint On'],
            ['erase', Eraser, 'Erase'],
          ] as const
        ).map(([tool, Icon, label]) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
              editorTool === tool
                ? 'bg-white/10 border-white/30 text-white'
                : 'border-tesla-border text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          <button
            onClick={onToggleAutoLayer}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
              showAutoLayer ? 'border-blue-500/50 text-blue-400' : 'border-tesla-border text-gray-600'
            }`}
          >
            {showAutoLayer ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Auto
          </button>
          <button
            onClick={onToggleManualLayer}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
              showManualLayer ? 'border-green-500/50 text-green-400' : 'border-tesla-border text-gray-600'
            }`}
          >
            {showManualLayer ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Manual
          </button>
          <button onClick={onClearManual} className="text-xs px-2 py-1 rounded border border-tesla-border text-gray-500 hover:text-red-400">
            Clear Manual
          </button>
        </div>
      </div>

      <p className="text-[10px] text-gray-600">
        Blue = auto-generated · Green = manual overrides. Play audio while watching the car preview to QA sync timing.
      </p>
    </div>
  )
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const rem = s % 60
  const cs = Math.floor((ms % 1000) / 10)
  return `${m}:${rem.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
}
