import { useEffect } from 'react'
import { Zap } from 'lucide-react'
import { AudioUpload } from './components/AudioUpload'
import { CarPreview } from './components/CarPreview'
import { ControlPanel } from './components/ControlPanel'
import { ExportPanel } from './components/ExportPanel'
import { QAPlayer } from './components/QAPlayer'
import { TimelineEditor } from './components/TimelineEditor'
import { WaveformView } from './components/WaveformView'
import { useLightShow } from './hooks/useLightShow'

export default function App() {
  const state = useLightShow()
  const {
    audioFile,
    waveform,
    analysis,
    syncSettings,
    autoEvents,
    mergedFrames,
    manualOverrides,
    showName,
    setShowName,
    isAnalyzing,
    error,
    currentFrame,
    isPlaying,
    selectedChannelId,
    setSelectedChannelId,
    editorTool,
    setEditorTool,
    showManualLayer,
    setShowManualLayer,
    showAutoLayer,
    setShowAutoLayer,
    loadAudio,
    regenerateAutoSync,
    updateSyncSettings,
    updateGlobalOffset,
    addManualEvent,
    removeManualEventsAt,
    clearManualEvents,
    play,
    pause,
    seek,
    setAudioElement,
  } = state

  useEffect(() => {
    if (!audioFile) return
    const url = URL.createObjectURL(audioFile)
    const audio = new Audio(url)
    audio.preload = 'auto'
    setAudioElement(audio)

    const onEnded = () => pause()
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.pause()
      URL.revokeObjectURL(url)
    }
  }, [audioFile, setAudioElement, pause])

  const hasShow = analysis && mergedFrames && waveform

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-tesla-border bg-tesla-panel/50 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="p-2 rounded-lg bg-tesla-red/20">
            <Zap className="w-5 h-5 text-tesla-red" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Tesla Light Show Studio</h1>
            <p className="text-xs text-gray-500">Model Y Juniper (2025/2026) · 200-channel FSEQ</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        {!hasShow ? (
          <div className="max-w-xl mx-auto mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create Your Light Show</h2>
              <p className="text-sm text-gray-400">
                Upload your music, auto-sync lights to the beat, fine-tune timing manually, preview in QA mode, then
                export to USB.
              </p>
            </div>
            <AudioUpload onFile={loadAudio} isLoading={isAnalyzing} />
            {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <WaveformView
                  waveform={waveform}
                  frameCount={analysis.frameCount}
                  currentFrame={currentFrame}
                  beats={analysis.beats}
                  onSeek={seek}
                  isPlaying={isPlaying}
                />

                <QAPlayer
                  isPlaying={isPlaying}
                  currentFrame={currentFrame}
                  frameCount={analysis.frameCount}
                  editorTool={editorTool}
                  showAutoLayer={showAutoLayer}
                  showManualLayer={showManualLayer}
                  onPlay={play}
                  onPause={pause}
                  onSeek={seek}
                  onToolChange={setEditorTool}
                  onToggleAutoLayer={() => setShowAutoLayer(!showAutoLayer)}
                  onToggleManualLayer={() => setShowManualLayer(!showManualLayer)}
                  onClearManual={clearManualEvents}
                />

                <TimelineEditor
                  frameCount={analysis.frameCount}
                  currentFrame={currentFrame}
                  autoEvents={autoEvents}
                  manualEvents={manualOverrides.events}
                  selectedChannelId={selectedChannelId}
                  editorTool={editorTool}
                  showAutoLayer={showAutoLayer}
                  showManualLayer={showManualLayer}
                  onSelectChannel={setSelectedChannelId}
                  onSeek={seek}
                  onPaint={(channelId, start, end) =>
                    addManualEvent({ channelId, startFrame: start, endFrame: end, value: 255 })
                  }
                  onErase={removeManualEventsAt}
                />
              </div>

              <div className="space-y-4">
                <CarPreview frames={mergedFrames} currentFrame={currentFrame} />
                <ControlPanel
                  settings={syncSettings}
                  globalOffsetMs={manualOverrides.globalOffsetMs}
                  onSettingsChange={updateSyncSettings}
                  onOffsetChange={updateGlobalOffset}
                  onRegenerate={regenerateAutoSync}
                />
                {audioFile && (
                  <ExportPanel
                    frames={mergedFrames}
                    frameCount={analysis.frameCount}
                    audioFile={audioFile}
                    showName={showName}
                    onShowNameChange={setShowName}
                  />
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full text-xs text-gray-500 hover:text-gray-300 py-2"
                >
                  Load different song
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
