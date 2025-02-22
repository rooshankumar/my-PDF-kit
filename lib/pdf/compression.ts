import { PDFDocument } from 'pdf-lib'

interface CompressionOptions {
  useObjectStreams: boolean
  addDefaultPage: boolean
  preservePDFFormFields: boolean
  compress: boolean
  // Additional quality settings
  imageQuality: number // 0-1
  compressImages: boolean
}

export async function compressPDF(file: File): Promise<File> {
  const originalSize = file.size
  
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // First try with high quality
    const highQualityOptions: CompressionOptions = {
      useObjectStreams: true,
      addDefaultPage: false,
      preservePDFFormFields: true,
      compress: true,
      imageQuality: 0.9,
      compressImages: true
    }

    let compressedBytes = await pdfDoc.save(highQualityOptions)
    let compressedSize = compressedBytes.length

    // If still larger than original, try medium quality
    if (compressedSize >= originalSize) {
      const mediumQualityOptions: CompressionOptions = {
        ...highQualityOptions,
        imageQuality: 0.7
      }
      compressedBytes = await pdfDoc.save(mediumQualityOptions)
      compressedSize = compressedBytes.length
    }

    // If still larger, try lower quality
    if (compressedSize >= originalSize) {
      const lowQualityOptions: CompressionOptions = {
        ...highQualityOptions,
        imageQuality: 0.5
      }
      compressedBytes = await pdfDoc.save(lowQualityOptions)
      compressedSize = compressedBytes.length
    }

    // If all compression attempts result in larger file, return original
    if (compressedSize >= originalSize) {
      console.log('Compression would increase file size, keeping original')
      return file
    }

    // Create new file with compressed data
    const compressedFile = new File(
      [compressedBytes],
      file.name,
      { type: file.type }
    )

    console.log(`PDF Compression: ${formatFileSize(originalSize)} -> ${formatFileSize(compressedFile.size)}`)
    return compressedFile

  } catch (error) {
    console.error('PDF compression failed:', error)
    return file // Return original file if compression fails
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 