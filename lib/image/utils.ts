import { PDFDocument, PDFPage, degrees, PDFEmbeddedPage, SaveOptions } from 'pdf-lib'

export interface PDFOptions {
  quality?: number
  pageSize?: 'A4' | 'A5' | 'Letter' | 'Legal' | 'Custom'
  orientation?: 'portrait' | 'landscape'
  margin?: number
  onProgress?: (percent: number) => void
}

const PAGE_SIZES = {
  A4: [595.28, 841.89],
  A5: [420.94, 595.28],
  Letter: [612, 792],
  Legal: [612, 1008],
  Custom: [595.28, 841.89] // Default to A4 size for custom
}

export async function convertToPDF(
  file: File,
  options: PDFOptions = {}
): Promise<Blob> {
  const {
    quality = 0.8,
    pageSize = 'A4',
    margin = 20,
    onProgress
  } = options

  const pdfDoc = await PDFDocument.create()
  const pageSizeArray = PAGE_SIZES[pageSize]
  const page = pdfDoc.addPage(pageSizeArray as [number, number])

  const imageBytes = await file.arrayBuffer()
  let image

  if (file.type.includes('jpeg') || file.type.includes('jpg')) {
    image = await pdfDoc.embedJpg(imageBytes)
  } else if (file.type.includes('png')) {
    image = await pdfDoc.embedPng(imageBytes)
  } else {
    throw new Error('Unsupported image format')
  }

  const { width: imgWidth, height: imgHeight } = image
  const pageWidth = page.getWidth()
  const pageHeight = page.getHeight()
  const marginPt = margin * 2.83465 // Convert mm to points

  const availableWidth = pageWidth - (marginPt * 2)
  const availableHeight = pageHeight - (marginPt * 2)
  const scale = Math.min(
    availableWidth / imgWidth,
    availableHeight / imgHeight
  )

  const scaledWidth = imgWidth * scale
  const scaledHeight = imgHeight * scale
  const x = (pageWidth - scaledWidth) / 2
  const y = (pageHeight - scaledHeight) / 2

  page.drawImage(image, {
    x,
    y,
    width: scaledWidth,
    height: scaledHeight
  })

  onProgress?.(50)

  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false
  })

  onProgress?.(100)

  return new Blob([pdfBytes], { type: 'application/pdf' })
}

export async function mergeImagesToPDF(
  files: File[],
  options: PDFOptions = {}
): Promise<Blob> {
  const {
    quality = 1,
    pageSize = 'A4',
    margin = 20,
    onProgress
  } = options

  const pdfDoc = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const page = pdfDoc.addPage(PAGE_SIZES[pageSize])

    const imageBytes = await file.arrayBuffer()
    let image

    if (file.type.includes('jpeg') || file.type.includes('jpg')) {
      image = await pdfDoc.embedJpg(imageBytes)
    } else if (file.type.includes('png')) {
      image = await pdfDoc.embedPng(imageBytes)
    } else {
      continue // Skip unsupported formats
    }

    const { width: imgWidth, height: imgHeight } = image
    const pageWidth = page.getWidth()
    const pageHeight = page.getHeight()
    const marginPt = margin * 2.83465 // Convert mm to points

    const availableWidth = pageWidth - (marginPt * 2)
    const availableHeight = pageHeight - (marginPt * 2)
    const scale = Math.min(
      availableWidth / imgWidth,
      availableHeight / imgHeight
    )

    const scaledWidth = imgWidth * scale
    const scaledHeight = imgHeight * scale
    const x = (pageWidth - scaledWidth) / 2
    const y = (pageHeight - scaledHeight) / 2

    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight
    })

    onProgress?.(Math.round((i + 1) / files.length * 80))
  }

  const pdfBytes = await pdfDoc.save()
  onProgress?.(90)

  return new Blob([pdfBytes], { type: 'application/pdf' })
}

// Other image handling functions remain unchanged

export const compressImage = async (
  file: File,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Could not compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Could not load image'))
    }
  })
}

export const resizeImage = async (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Could not resize image'))
          }
        },
        'image/jpeg',
        0.9
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Could not load image'))
    }
  })
}

export const convertToFormat = async (
  file: File,
  format: 'jpeg' | 'png' | 'webp'
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(img.src)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Could not convert image'))
          }
        },
        `image/${format}`,
        0.9
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Could not load image'))
    }
  })
}

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

type PageSize = [number, number]

export async function createPDFFromImages(
  images: File[],
  options: {
    format?: PageSize
    rotation?: number
    quality?: number
    onProgress?: (progress: number) => void
  } = {}
): Promise<Uint8Array> {
  const defaultSize: PageSize = [595, 842] // A4 size in points
  const {
    format = defaultSize,
    rotation = 0,
    quality = 0.8,
    onProgress
  } = options

  const pdfDoc = await PDFDocument.create()
  let processedImages = 0

  for (const image of images) {
    const imageBytes = await image.arrayBuffer()
    let embeddedImage

    if (image.type === 'image/jpeg' || image.type === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(imageBytes)
    } else if (image.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(imageBytes)
    } else {
      throw new Error('Unsupported image format')
    }

    const pageSize: PageSize = [format[0], format[1]]
    const page = pdfDoc.addPage(pageSize)
    const { width: imgWidth, height: imgHeight } = embeddedImage.scale(1)
    const scaledDims = getScaledDimensions(imgWidth, imgHeight, pageSize[0], pageSize[1])

    page.drawImage(embeddedImage, {
      x: (pageSize[0] - scaledDims.width) / 2,
      y: (pageSize[1] - scaledDims.height) / 2,
      width: scaledDims.width,
      height: scaledDims.height,
      rotate: degrees(rotation),
    })

    processedImages++
    onProgress?.(Math.round((processedImages / images.length) * 100))
  }

  // Only include valid properties for SaveOptions
  const saveOptions: SaveOptions = {
    useObjectStreams: true,
    addDefaultPage: false
  }

  return await pdfDoc.save(saveOptions)
}

function getScaledDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const ratio = Math.min(maxWidth / width, maxHeight / height)
  return {
    width: width * ratio,
    height: height * ratio,
  }
}

export async function mergePDFs(
  files: File[],
  options: {
    format?: PageSize
    onProgress?: (progress: number) => void
  } = {}
): Promise<Uint8Array> {
  const defaultSize: PageSize = [595, 842] // A4 size in points
  const {
    format = defaultSize,
    onProgress
  } = options

  const mergedPdf = await PDFDocument.create()
  let processedFiles = 0

  for (const file of files) {
    const pdfBytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(pdfBytes)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())

    for (const page of copiedPages) {
      const pageWidth = page.getWidth()
      const pageHeight = page.getHeight()

      if (pageWidth !== format[0] || pageHeight !== format[1]) {
        const newPageSize: PageSize = [format[0], format[1]]
        const newPage = mergedPdf.addPage(newPageSize)
        const scale = Math.min(format[0] / pageWidth, format[1] / pageHeight)
        const x = (format[0] - pageWidth * scale) / 2
        const y = (format[1] - pageHeight * scale) / 2

        const embeddedPage = await mergedPdf.embedPage(page)
        newPage.drawPage(embeddedPage, {
          x,
          y,
          xScale: scale,
          yScale: scale,
        })
      } else {
        mergedPdf.addPage(page)
      }
    }

    processedFiles++
    onProgress?.(Math.round((processedFiles / files.length) * 100))
  }

  // Only include valid properties for SaveOptions
  const saveOptions: SaveOptions = {
    useObjectStreams: true,
    addDefaultPage: false
  }

  return await mergedPdf.save(saveOptions)
}