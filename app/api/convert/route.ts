import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { createCanvas, Image, loadImage } from 'canvas'

const PAGE_SIZES = {
  a4: [595.28, 841.89],
  a3: [841.89, 1190.55],
  letter: [612, 792]
}

type Compression = 'none' | 'medium' | 'high'
const COMPRESSION_QUALITY = {
  none: 1,
  medium: 0.7,
  high: 0.4
}

const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'application/octet-stream'
]

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('file') as File[]
    const pageSize = formData.get('pageSize') as keyof typeof PAGE_SIZES || 'a4'
    const orientation = formData.get('orientation') as 'portrait' | 'landscape' || 'portrait'
    const compression = formData.get('compression') as Compression || 'medium'

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // Create PDF with proper dimensions and orientation
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'pt',
      format: pageSize
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Process each image
    for (let i = 0; i < files.length; i++) {
      // Add new page for all images except the first one
      if (i > 0) {
        pdf.addPage(pageSize, orientation)
      }

      const file = files[i]
      
      try {
        // Convert file to data URL
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const mimeType = file.type || 'image/jpeg' // Default to JPEG if no type
        const dataUrl = `data:${mimeType};base64,${base64}`

        // Load image using canvas
        const img = await loadImage(dataUrl)

        // Calculate scaling to fit image to PDF
        const scale = Math.min(
          pdfWidth / img.width,
          pdfHeight / img.height
        )

        // Center the image on the page
        const x = (pdfWidth - (img.width * scale)) / 2
        const y = (pdfHeight - (img.height * scale)) / 2

        // Create canvas with proper dimensions
        const canvas = createCanvas(img.width, img.height)
        const ctx = canvas.getContext('2d')
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, img.width, img.height)

        // Convert to JPEG data URL with compression
        const jpegDataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY[compression])

        // Add image to PDF
        pdf.addImage(
          jpegDataUrl,
          'JPEG',
          x,
          y,
          img.width * scale,
          img.height * scale,
          undefined,
          'FAST'
        )

      } catch (error) {
        console.error(`Error processing image ${file.name}:`, error)
        throw new Error(`Failed to process image "${file.name}". Please ensure it's a valid image file.`)
      }
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"'
      }
    })

  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to convert images. Please ensure all files are valid images.'
      },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

