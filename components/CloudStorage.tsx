"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileWithPreview } from '@/types/files'
import { Cloud, Share2 } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

interface CloudStorageProps {
  fileUrl?: string
  files?: FileWithPreview[]
  onClose?: () => void
}

interface CloudProvider {
  id: string
  name: string
  icon: JSX.Element
  color: string
}

const cloudProviders: CloudProvider[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: <Cloud className="h-5 w-5" />,
    color: 'bg-[#4285F4] hover:bg-[#3367D6]'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: <Cloud className="h-5 w-5" />,
    color: 'bg-[#0061FF] hover:bg-[#004EC2]'
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: <Cloud className="h-5 w-5" />,
    color: 'bg-[#0078D4] hover:bg-[#005FB3]'
  }
]

export function CloudStorage({ files = [], fileUrl, onClose }: CloudStorageProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = useCallback(async (providerId: string) => {
    setSelectedProvider(providerId)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setUploadProgress(i)
      }

      // Here you would actually upload to the selected cloud provider
      console.log(`Uploading to ${providerId}...`)
      
      if (fileUrl) {
        console.log(`File URL to upload: ${fileUrl}`)
      } else if (files.length > 0) {
        console.log(`Files to upload: ${files.map(f => f.name).join(', ')}`)
      }

    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
      setSelectedProvider(null)
      setUploadProgress(0)
      onClose?.()
    }
  }, [files, fileUrl, onClose])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share & Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share & Save Files</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          {/* Cloud Providers */}
          <div className="grid grid-cols-1 gap-3">
            {cloudProviders.map((provider) => (
              <Button
                key={provider.id}
                className={`flex items-center justify-center gap-2 text-white ${provider.color}`}
                onClick={() => handleUpload(provider.id)}
                disabled={isUploading}
              >
                {provider.icon}
                {isUploading && selectedProvider === provider.id ? (
                  <span>{uploadProgress}%</span>
                ) : (
                  <span>Save to {provider.name}</span>
                )}
              </Button>
            ))}
          </div>

          {/* Share Link & QR Code */}
          {/* Removed this section */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
