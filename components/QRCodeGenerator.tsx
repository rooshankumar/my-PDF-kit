"use client"

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Download } from 'lucide-react'

interface QRCodeGeneratorProps {
  url: string
  size?: number
}

export function QRCodeGenerator({ url, size = 128 }: QRCodeGeneratorProps) {
  const [downloadUrl, setDownloadUrl] = useState<string>('')

  const handleDownload = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png')
      setDownloadUrl(pngUrl)
      
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = 'qr-code.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="p-4 bg-white">
        <QRCodeCanvas
          value={url}
          size={size}
          level="H"
          includeMargin
        />
      </Card>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Download QR Code
      </Button>
    </div>
  )
}
