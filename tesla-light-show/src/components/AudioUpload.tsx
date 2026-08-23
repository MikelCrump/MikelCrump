import { Upload, Music, Loader2 } from 'lucide-react'

interface Props {
  onFile: (file: File) => void
  isLoading: boolean
  fileName?: string
}

export function AudioUpload({ onFile, isLoading, fileName }: Props) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg)$/i))) {
      onFile(file)
    }
  }

  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-tesla-border bg-tesla-panel p-8 cursor-pointer hover:border-tesla-accent/50 transition-colors"
    >
      <input
        type="file"
        accept="audio/*,.mp3,.wav,.m4a"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
      {isLoading ? (
        <Loader2 className="w-10 h-10 text-tesla-accent animate-spin" />
      ) : (
        <Upload className="w-10 h-10 text-gray-500" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">
          {fileName ? (
            <span className="flex items-center gap-2 justify-center">
              <Music className="w-4 h-4" /> {fileName}
            </span>
          ) : (
            'Drop your music file here or click to browse'
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">MP3 or WAV · 44.1 kHz recommended</p>
      </div>
    </label>
  )
}
