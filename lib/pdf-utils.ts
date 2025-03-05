import { PDFDocument, SaveOptions } from 'pdf-lib'
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

export async function compressPDF(
  pdfFile: File,
  compressionLevel: 'low' | 'medium' | 'high' = 'medium'
): Promise<Uint8Array> {
  // Load the PDF file
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Get all pages
  const pages = pdfDoc.getPages();

  // Compression settings based on level
  let options: SaveOptions = {
    useObjectStreams: true,
  };

  // Apply compression settings based on level
  if (compressionLevel === 'low') {
    options = {
      ...options,
      useObjectStreams: true,
      addDefaultPage: false,
    };
  } else if (compressionLevel === 'medium') {
    options = {
      ...options,
      useObjectStreams: true,
      addDefaultPage: false,
      compress: true
    };

    // Medium compression - adjust image quality if needed
    for (const page of pages) {
      // This is placeholder for actual implementation
      // In a real implementation, we would extract images and recompress them
      continue;
    }
  } else if (compressionLevel === 'high') {
    options = {
      ...options,
      useObjectStreams: true,
      addDefaultPage: false,
      compress: true
    };

    // High compression - process images more aggressively
    for (const page of pages) {
      // This is placeholder for actual implementation
      // In a real implementation, we would extract images and recompress them at lower quality
      continue;
    }
  }

  console.log(`PDF Compression level: ${compressionLevel}`);
  return await pdfDoc.save(options);
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
    // Here we'd use pdf.js to render each page (placeholder)
    const canvas = document.createElement('canvas')
    // Implementation of PDF to canvas rendering would go here

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