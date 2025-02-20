import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, PageSizes } from 'pdf-lib'

export const runtime = 'edge'

// Define types for the form data
type PageSize = 'a4' | 'a3' | 'letter'
type Orientation = 'portrait' | 'landscape'
type Compression = 'none' | 'medium' | 'high'

// Define compression quality levels
const COMPRESSION_LEVELS = {
  none: 1.0,
  medium: 0.7,
  high: 0.5
} as const

const PAGE_SIZES: { [key in PageSize]: [number, number] } = {
  a4: PageSizes.A4,
  a3: PageSizes.A3,
  letter: PageSizes.Letter
}

const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png'
]

// Helper function to validate orientation
function validateOrientation(orientation: string): Orientation {
  if (orientation !== 'portrait' && orientation !== 'landscape') {
    throw new Error('Invalid orientation')
  }
  return orientation
}

// Helper function to validate page size
function validatePageSize(size: string): PageSize {
  if (!PAGE_SIZES[size as PageSize]) {
    throw new Error('Invalid page size')
  }
  return size as PageSize
}

// Helper function to validate compression
function validateCompression(compression: string): Compression {
  if (!COMPRESSION_LEVELS[compression as Compression]) {
    throw new Error('Invalid compression level')
  }
  return compression as Compression
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const files = data.getAll('files') as File[]
    
    // Validate inputs
    const pageSize = validatePageSize(data.get('pageSize') as string)
    const orientation = validateOrientation(data.get('orientation') as string)
    const compression = validateCompression(data.get('compression') as string)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    
    // Process images and add to PDF
    for (const file of files) {
      const imageBytes = await file.arrayBuffer()
      
      // Get dimensions from the page size
      let [width, height] = PAGE_SIZES[pageSize]
      if (orientation === 'landscape') {
        [width, height] = [height, width]
      }
      
      // Create a new page
      const page = pdfDoc.addPage([width, height])
      
      // Embed the image
      let image
      const contentType = file.type.toLowerCase()
      
      if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
        image = await pdfDoc.embedJpg(imageBytes)
      } else if (contentType === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes)
      } else {
        throw new Error('Unsupported image format')
      }
      
      const imgDims = image.scale(1)
      
      // Calculate dimensions to maintain aspect ratio
      const scale = Math.min(
        width / imgDims.width,
        height / imgDims.height
      ) * 0.95 // Leave a small margin
      
      const scaledWidth = imgDims.width * scale
      const scaledHeight = imgDims.height * scale
      
      // Center the image on the page
      const x = (width - scaledWidth) / 2
      const y = (height - scaledHeight) / 2
      
      // Draw the image
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight
      })
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"'
      }
    })

  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert images' },
      { status: 500 }
    )
  }
}
