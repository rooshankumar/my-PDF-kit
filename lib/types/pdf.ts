
import { PDFDocument } from 'pdf-lib'

export interface SaveOpti {
  useObjectStreams?: boolean
  addDefaultPage?: boolean
  compress?: boolean
  imageQuality?: number
}

export type PDFDocumentWithSave = PDFDocument & {
  save: (options?: SaveOpti) => Promise<Uint8Array>
}
