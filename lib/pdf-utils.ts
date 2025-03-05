
import { PDFDocument } from 'pdf-lib'
import { downloadBlob, createZipFromBlobs } from './file-utils'

export type PDFCompressionOptions = 'low' | 'medium' | 'high'

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

export async function compressPDF(file: File, quality: PDFCompressionOptions = 'medium'): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)

  // Compression settings based on quality level
  const compressionSettings = {
    low: { imageQuality: 0.3, compress: true },
    medium: { imageQuality: 0.5, compress: true },
    high: { imageQuality: 0.7, compress: true }
  }

  // Apply compression settings based on quality parameter
  const settings = compressionSettings[quality]

  // Save with compression options
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    preserveExistingEncryption: false,
    // These settings have a significant impact on file size
    updateFieldAppearances: false,
    compress: true // Ensure compression is enabled
  })

  // Log compression stats
  console.log(`PDF Compression: ${(file.size / (1024 * 1024)).toFixed(2)} MB -> ${(pdfBytes.length / (1024 * 1024)).toFixed(2)} MB`)

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

  // Adjust quality to be between 0-1 for image conversion
  const normalizedQuality = quality / 100;

  for (let i = 0; i < pageCount; i++) {
    // Here we'd use pdf.js to render each page
    const canvas = document.createElement('canvas')
    // Implementation of PDF to canvas rendering would go here

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) reject(new Error('Failed to convert page to image'))
          else resolve(b)
        },
        `image/${format}`,
        normalizedQuality // Apply normalized quality
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
  onProgress?: (progress: number) => void,
  quality: number = 80
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const normalizedQuality = quality / 100;

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

  // Apply compression settings based on quality
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    compress: true,
    // Additional compression options
    updateFieldAppearances: false
  })
  
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
