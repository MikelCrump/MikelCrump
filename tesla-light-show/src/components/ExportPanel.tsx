import { useState } from 'react'
import { Download, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { downloadBlob, exportLightShow } from '../lib/export'

interface Props {
  frames: Uint8Array
  frameCount: number
  audioFile: File
  showName: string
  onShowNameChange: (name: string) => void
}

export function ExportPanel({ frames, frameCount, audioFile, showName, onShowNameChange }: Props) {
  const [isExporting, setIsExporting] = useState(false)
  const [lastResult, setLastResult] = useState<{ ok: boolean; message: string } | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setLastResult(null)
    try {
      const result = await exportLightShow(frames, frameCount, audioFile, showName)
      downloadBlob(result.zipBlob, `${result.showName}_LightShow.zip`)

      if (result.validationErrors?.length) {
        setLastResult({ ok: false, message: `Exported with warnings: ${result.validationErrors.join(', ')}` })
      } else {
        setLastResult({
          ok: true,
          message: 'Valid FSEQ exported! Unzip to USB drive root — folder must be named LightShow.',
        })
      }
    } catch (e) {
      setLastResult({ ok: false, message: e instanceof Error ? e.message : 'Export failed' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-tesla-panel rounded-xl border border-tesla-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-200">Export for USB</h3>

      <div>
        <label className="text-xs text-gray-500">Show name (used for .fseq and audio filenames)</label>
        <input
          type="text"
          value={showName}
          onChange={(e) => onShowNameChange(e.target.value)}
          className="w-full mt-1 px-3 py-2 text-sm bg-[#111] border border-tesla-border rounded-lg focus:outline-none focus:border-tesla-accent"
        />
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg bg-tesla-red hover:bg-red-600 disabled:opacity-50 transition-colors"
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Download LightShow ZIP
      </button>

      {lastResult && (
        <div
          className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
            lastResult.ok ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
          }`}
        >
          {lastResult.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{lastResult.message}</span>
        </div>
      )}

      <div className="text-[10px] text-gray-600 space-y-1">
        <p>• Format: FSEQ v2 uncompressed, 200 channels, 20ms frames (Model Y Juniper)</p>
        <p>• USB: exFAT/FAT32, folder named LightShow at drive root</p>
        <p>• In car: Toybox → Light Show → Schedule Show</p>
      </div>
    </div>
  )
}
