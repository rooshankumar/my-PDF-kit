import { PDFDocument } from 'pdf-lib'

interface MergeOptions {
  useObjectStreams: boolean
  addDefaultPage: boolean
  preservePDFFormFields: true
  compress: boolean
  imageQuality: number
  compressImages: boolean
}

export async function mergePDFs(files: File[], onProgress?: (progress: number) => void): Promise<Uint8Array> {
  try {
    const mergedPdf = await PDFDocument.create()
    let totalPages = 0
    let processedPages = 0

    // First, count total pages
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      totalPages += pdf.getPageCount()
    }

    // Merge PDFs with compression
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      
      pages.forEach(page => {
        mergedPdf.addPage(page)
        processedPages++
        onProgress?.(Math.round((processedPages / totalPages) * 100))
      })
    }

    // Apply compression settings
    const mergeOptions: MergeOptions = {
      useObjectStreams: true,
      addDefaultPage: false,
      preservePDFFormFields: true,
      compress: true,
      imageQuality: 0.8,
      compressImages: true
    }

    // First try with high quality
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