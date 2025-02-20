import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'

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

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const files = data.getAll('files') as File[]
    const pageSize = (data.get('pageSize') as PageSize) || 'a4'
    const orientation = (data.get('orientation') as Orientation) || 'portrait'
    const compression = (data.get('compression') as Compression) || 'medium'

    // Create PDF
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize,
    })

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (i > 0) {
        doc.addPage()
      }

      // Convert File to base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const imgData = `data:${file.type};base64,${base64}`

      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Add image to PDF
      doc.addImage(
        imgData,
        file.type.split('/')[1].toUpperCase(),
        0,
        0,
        pageWidth,
        pageHeight,
        `image-${i}`,
        'FAST'
      )
    }

    // Convert to blob
    const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' })
    const pdfBuffer = await pdfBlob.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"',
      },
    })

  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to convert images: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

