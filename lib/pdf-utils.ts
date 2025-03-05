import { PDFDocument } from 'pdf-lib'
import { downloadBlob, createZipFromBlobs } from './file-utils'

export async function splitPDF(file: File, pages: number[]): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const blobs: Blob[] = []

  for (const pageNum of pages) {
    const newPdf = await PDFDocument.create()
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1])
    newPdf.addPage(copiedPage)
    const pdfBytes = await newPdf.save()
    blobs.push(new Blob([pdfBytes], { type: 'application/pdf' }))
  }

  return blobs
}

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
      totalPages += pdfDoc.getPageIndices().length
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
      compress: true,
      addDefaultPage: false,
      preserveExistingEncryption: false
    })
    
    return pdfBytes
  } catch (error) {
    console.error('PDF merge error:', error)
    throw error
  }
}

export type PDFCompressionOptions = 'low' | 'medium' | 'high'

export async function compressPDF(file: File, quality?: PDFCompressionOptions): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  
  // Compression settings
  const compressionSettings = {
    low: { imageQuality: 0.3, compress: true },
    medium: { imageQuality: 0.5, compress: true },
    high: { imageQuality: 0.7, compress: true }
  }
  
  const settings = quality ? compressionSettings[quality] : compressionSettings.medium
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    ...settings
  })
  
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

export async function convertPDFToImages(
  file: File,
  format: 'jpeg' | 'png',
  quality: number,
  onProgress?: (progress: number) => void
): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const pageCount = pdfDoc.getPageCount()
  const blobs: Blob[] = []

  for (let i = 0; i < pageCount; i++) {
    // Here we'll use pdf.js to render each page
    const canvas = document.createElement('canvas')
    // Implementation of PDF to canvas rendering
    // This is a placeholder - actual implementation needs pdf.js
    
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) reject(new Error('Failed to convert page to image'))
          else resolve(b)
        },
        `image/${format}`,
        quality / 100
      )
    })
    
    blobs.push(blob)
    if (onProgress) {
      onProgress(((i + 1) / pageCount) * 100)
    }
  }

  return blobs
}

export async function convertImagesToPDF(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const imageBytes = await file.arrayBuffer()
    
    let image
    if (file.type === 'image/jpeg') {
      image = await pdfDoc.embedJpg(imageBytes)
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes)
    } else {
      throw new Error('Unsupported image format')
    }

    const page = pdfDoc.addPage([image.width, image.height])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })

    if (onProgress) {
      onProgress(((i + 1) / files.length) * 100)
    }
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
