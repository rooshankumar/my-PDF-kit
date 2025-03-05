
import { PDFDocument, PDFPage } from 'pdf-lib'

type MergeOptions = {
  imageQuality?: number
  compress?: boolean
}

export async function mergePDFs(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const mergedPdf = await PDFDocument.create()
    let totalPages = 0
    let completedPages = 0

    // First pass: count total pages
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      totalPages += pdfDoc.getPageIndices().length
    }

    // Second pass: merge PDFs
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      const pages = pdfDoc.getPageIndices()
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pages)
      
      copiedPages.forEach(page => {
        mergedPdf.addPage(page)
        completedPages++
        if (onProgress) {
          onProgress((completedPages / totalPages) * 100)
        }
      })
    }

    // Try with different quality settings to optimize file size
    const mergeOptions: MergeOptions = {
      imageQuality: 0.8,
      compress: true
    }
    
    let mergedBytes = await mergedPdf.save(mergeOptions)
    let mergedSize = mergedBytes.length

    // If result is too large, try medium quality
    if (mergedSize > files.reduce((acc, file) => acc + file.size, 0)) {
      mergeOptions.imageQuality = 0.6
      mergedBytes = await mergedPdf.save(mergeOptions)
      mergedSize = mergedBytes.length
    }

    // If still too large, try lower quality
    if (mergedSize > files.reduce((acc, file) => acc + file.size, 0)) {
      mergeOptions.imageQuality = 0.4
      mergedBytes = await mergedPdf.save(mergeOptions)
    }

    return mergedBytes
  } catch (error) {
    console.error('PDF merge failed:', error)
    throw error
  }
}
