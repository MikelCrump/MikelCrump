import JSZip from 'jszip'
import { Validator } from '@xsor/tlsv'
import { encodeFseq } from './fseq'
import { CHANNEL_COUNT, STEP_MS } from '../types'

export interface ExportResult {
  zipBlob: Blob
  showName: string
  validationErrors?: string[]
}

export async function exportLightShow(
  frames: Uint8Array,
  frameCount: number,
  audioFile: File,
  showName: string,
): Promise<ExportResult> {
  const safeName = sanitizeName(showName)
  const fseqBuffer = encodeFseq(frames, frameCount, CHANNEL_COUNT, STEP_MS)

  const validation = Validator(fseqBuffer)
  const validationErrors = validation.errors
    ? Object.entries(validation.errors).map(([k, v]) => `${k}: ${v}`)
    : undefined

  const zip = new JSZip()
  const folder = zip.folder('LightShow')
  if (!folder) throw new Error('Failed to create zip folder')

  const ext = audioFile.name.split('.').pop()?.toLowerCase() || 'mp3'
  folder.file(`${safeName}.fseq`, fseqBuffer)
  folder.file(`${safeName}.${ext}`, audioFile)

  const zipBlob = await zip.generateAsync({ type: 'blob' })

  return { zipBlob, showName: safeName, validationErrors }
}

function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40) || 'lightshow'
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
