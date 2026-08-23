import { Sparkles, Sliders } from 'lucide-react'
import type { SyncSettings } from '../types'

interface Props {
  settings: SyncSettings
  globalOffsetMs: number
  onSettingsChange: (patch: Partial<SyncSettings>) => void
  onOffsetChange: (ms: number) => void
  onRegenerate: () => void
}

export function ControlPanel({ settings, globalOffsetMs, onSettingsChange, onOffsetChange, onRegenerate }: Props) {
  return (
    <div className="bg-tesla-panel rounded-xl border border-tesla-border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-tesla-accent" />
        <h3 className="text-sm font-semibold text-gray-200">Auto Sync Settings</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Slider label="Intensity" value={settings.intensity} onChange={(v) => onSettingsChange({ intensity: v })} />
        <Slider
          label="Bass Sensitivity"
          value={settings.bassSensitivity}
          onChange={(v) => onSettingsChange({ bassSensitivity: v })}
        />
        <Slider
          label="Beat Sensitivity"
          value={settings.beatSensitivity}
          onChange={(v) => onSettingsChange({ beatSensitivity: v })}
        />
        <Slider
          label="Auto Sync Offset"
          value={(settings.autoOffsetMs + 500) / 1000}
          min={0}
          max={1}
          step={0.01}
          displayValue={`${settings.autoOffsetMs > 0 ? '+' : ''}${settings.autoOffsetMs}ms`}
          onChange={(v) => onSettingsChange({ autoOffsetMs: Math.round(v * 1000 - 500) })}
        />
        <Slider
          label="Manual Layer Offset"
          value={(globalOffsetMs + 500) / 1000}
          min={0}
          max={1}
          step={0.01}
          displayValue={`${globalOffsetMs > 0 ? '+' : ''}${globalOffsetMs}ms`}
          onChange={(v) => onOffsetChange(Math.round(v * 1000 - 500))}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['useHeadlights', 'Headlights'],
            ['useBrakeLights', 'Brake/Tail'],
            ['useTurnSignals', 'Turn Signals'],
            ['useSideMarkers', 'Side Markers'],
            ['useSignature', 'Signature'],
            ['alternateSides', 'Alternate L/R'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onSettingsChange({ [key]: !settings[key] })}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              settings[key]
                ? 'bg-tesla-accent/20 border-tesla-accent text-tesla-accent'
                : 'bg-transparent border-tesla-border text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={onRegenerate}
        className="w-full py-2 text-sm font-medium rounded-lg bg-tesla-accent/20 text-tesla-accent border border-tesla-accent/40 hover:bg-tesla-accent/30 transition-colors"
      >
        Regenerate Auto Sync
      </button>
    </div>
  )
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  displayValue,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  displayValue?: string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span className="flex items-center gap-1">
          <Sliders className="w-3 h-3" /> {label}
        </span>
        <span>{displayValue ?? value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-tesla-accent"
      />
    </div>
  )
}
