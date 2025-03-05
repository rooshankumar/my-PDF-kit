import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    const mergedPdf = await PDFDocument.create()
    let totalPages = 0;
    let processedPages = 0;

    // First, count total pages to track progress
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      totalPages += pdfDoc.getPageCount()
    }

    // Then perform the merge
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
        processedPages++;
        if (onProgress) {
          onProgress((processedPages / totalPages) * 100)
        }
      })
    }

    // Use compression options for better results
    const pdfBytes = await mergedPdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      preserveExistingEncryption: false
    })

    return pdfBytes
  } catch (error) {
    console.error('PDF merge error:', error)
    throw error
  }
}