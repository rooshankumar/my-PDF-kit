"use strict";

import { PDFDocument } from 'pdf-lib'
import * as pdfjs from 'pdfjs-dist'
import JSZip from 'jszip'

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface PDFCompressionOptions {
  useObjectStreams: boolean
  addDefaultPage: boolean
  preservePDFFormFields: boolean
  compress: boolean
  imageQuality: number
  compressImages: boolean
}

async function getOptimalCompression(pdfDoc: PDFDocument, originalSize: number): Promise<Uint8Array> {
  const compressionLevels = [
    { quality: 0.9, compress: true },
    { quality: 0.7, compress: true },
    { quality: 0.5, compress: true },
    { quality: 0.3, compress: true }
  ]

  let bestBytes: Uint8Array | null = null
  let bestSize = originalSize

  for (const level of compressionLevels) {
    const options: PDFCompressionOptions = {
      useObjectStreams: true,
      addDefaultPage: false,
      preservePDFFormFields: true,
      compress: true,
      imageQuality: level.quality,
      compressImages: true
    }

    const bytes = await pdfDoc.save(options)
    if (bytes.length < bestSize) {
      bestBytes = bytes
      bestSize = bytes.length
    }

    // If we've achieved good compression, stop trying
    if (bestSize < originalSize * 0.7) {
      break
    }
  }

  return bestBytes || await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    preservePDFFormFields: true,
    compress: true,
    imageQuality: 0.5,
    compressImages: true
  })
}

export const compressPDF = async (file: File): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)

  // Create a new document for compression
  const compressedDoc = await PDFDocument.create()
  const pages = await compressedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices())
  pages.forEach(page => compressedDoc.addPage(page))

  const compressedBytes = await getOptimalCompression(compressedDoc, file.size)

  // Log compression results
  console.log(`Original size: ${formatBytes(file.size)}`)
  console.log(`Compressed size: ${formatBytes(compressedBytes.length)}`)
  console.log(`Compression ratio: ${((1 - compressedBytes.length / file.size) * 100).toFixed(2)}%`)

  return new Blob([compressedBytes], { type: 'application/pdf' })
}

export const splitPDFByPages = async (
  file: File,
  pages: number[]
): Promise<Blob[]> => {
  let sourcePdfDoc: PDFDocument | null = null;
  const results: Blob[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    sourcePdfDoc = await PDFDocument.load(arrayBuffer);

    if (!sourcePdfDoc || sourcePdfDoc.getPageCount() === 0) {
      throw new Error('Invalid or empty PDF document');
    }

    for (const pageNum of pages) {
      if (pageNum < 1 || pageNum > sourcePdfDoc.getPageCount()) {
        throw new Error(`Invalid page number: ${pageNum}`);
      }

      const newPdfDoc = await PDFDocument.create();
      const [page] = await newPdfDoc.copyPages(sourcePdfDoc, [pageNum - 1]);
      newPdfDoc.addPage(page);
      const pdfBytes = await newPdfDoc.save();
      results.push(new Blob([pdfBytes], { type: 'application/pdf' }));

      // Clean up individual split document
      (newPdfDoc as any) = null;
    }
    return results
  } catch (error) {
    console.error("Error splitting PDF:", error);
    throw error;
  }
}

export async function mergePDFs(files: File[], onProgress?: (progress: number) => void): Promise<Blob> {
  // Merge implementation
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices())
    pages.forEach(page => pdfDoc.addPage(page))
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

export const createZipFromBlobs = async (
  blobs: Blob[],
  names: string[]
): Promise<Blob> => {
  const zip = new JSZip()

  for (let i = 0; i < blobs.length; i++) {
    zip.file(names[i], blobs[i])
  }

  return await zip.generateAsync({ type: 'blob' })
}

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const convertPDFToImages = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob[]> => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages
  const results: Blob[] = []

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Could not get canvas context')
    }

    canvas.height = viewport.height
    canvas.width = viewport.width

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/jpeg', 0.95)
    })

    results.push(blob)

    if (onProgress) {
      onProgress((i / totalPages) * 100)
    }
  }

  return results
}