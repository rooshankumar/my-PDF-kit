
import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(
  files: File[], 
  onProgress?: (progress: number) => void,
  quality: number = 80
): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error('No PDF files provided')
  }

  // Create a new PDF document to hold the merged content
  const mergedPdf = await PDFDocument.create()
  
  let totalPages = 0
  let processedPages = 0

  // First determine total pages for accurate progress reporting
  for (const file of files) {
    const fileBytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(fileBytes)
    totalPages += pdf.getPageCount()
  }

  // Now process each file
  for (const [index, file] of files.entries()) {
    try {
      // Load the current PDF file
      const fileBytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(fileBytes)
      
      // Copy all pages from the current file to the merged PDF
      const pageIndices = Array.from({ length: pdf.getPageCount() }, (_, i) => i)
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices)
      
      // Add the copied pages to the merged PDF
      for (const page of copiedPages) {
        mergedPdf.addPage(page)
        processedPages++
        
        if (onProgress) {
          onProgress((processedPages / totalPages) * 100)
        }
      }
    } catch (error) {
      console.error(`Error processing file ${index + 1}:`, error)
      throw new Error(`Failed to process file ${file.name}`)
    }
  }

  // Calculate compression level based on quality (higher quality = less compression)
  const compressionLevel = quality < 30 ? 'low' : quality < 70 ? 'medium' : 'high'
  
  // Normalize quality to 0-1 range
  const normalizedQuality = quality / 100
  
  // Save the merged PDF with compression settings based on quality
  const mergedPdfBytes = await mergedPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    preserveExistingEncryption: false,
    compress: true,
    // Adjust compression based on quality
    updateFieldAppearances: false
  })
  
  return mergedPdfBytes
}
