import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import * as pdfjs from 'pdfjs-dist'

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
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const results: Blob[] = []

  for (const pageNum of pages) {
    const newPdfDoc = await PDFDocument.create()
    const [page] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1])
    newPdfDoc.addPage(page)
    const pdfBytes = await newPdfDoc.save()
    results.push(new Blob([pdfBytes], { type: 'application/pdf' }))
  }

  return results
}

export const mergePDFs = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    // First compress each file
    const compressedFiles: Blob[] = []
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressPDF(files[i])
      compressedFiles.push(compressed)
      onProgress?.(Math.round((i + 1) / files.length * 40))
    }

    // Create merged document
    const mergedDoc = await PDFDocument.create()
    
    // Merge compressed PDFs
    for (let i = 0; i < compressedFiles.length; i++) {
      const fileArrayBuffer = await compressedFiles[i].arrayBuffer()
      const pdf = await PDFDocument.load(fileArrayBuffer)
      const pages = await mergedDoc.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => mergedDoc.addPage(page))
      onProgress?.(40 + Math.round((i + 1) / files.length * 40))
    }

    // Final compression of merged document
    const originalSize = files.reduce((acc, file) => acc + file.size, 0)
    const mergedBytes = await getOptimalCompression(mergedDoc, originalSize)
    onProgress?.(100)

    return new Blob([mergedBytes], { type: 'application/pdf' })
  } catch (error) {
    console.error('PDF merge failed:', error)
    throw error
  }
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
  options: {
    format?: 'jpeg' | 'png'
    quality?: number
    onProgress?: (progress: number) => void
  } = {}
): Promise<Blob[]> => {
  const { format = 'jpeg', quality = 0.8, onProgress } = options
  const images: Blob[] = []

  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const totalPages = pdf.getPageCount()

    for (let i = 0; i < totalPages; i++) {
      // Create a new document for each page
      const singlePage = await PDFDocument.create()
      const [copiedPage] = await singlePage.copyPages(pdf, [i])
      singlePage.addPage(copiedPage)

      // Convert to image using browser's PDF rendering
      const pdfData = await singlePage.save()
      const blob = new Blob([pdfData], { type: 'application/pdf' })
      const imageUrl = URL.createObjectURL(blob)

      // Create an image from the PDF page
      const img = await createImageFromPDF(imageUrl, format, quality)
      images.push(img)

      URL.revokeObjectURL(imageUrl)
      onProgress?.(Math.round(((i + 1) / totalPages) * 100))
    }

    return images
  } catch (error) {
    console.error('PDF to Image conversion failed:', error)
    throw error
  }
}

async function createImageFromPDF(url: string, format: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to convert to image'))
        },
        `image/${format}`,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load PDF page'))
    }

    img.src = url
  })
}
