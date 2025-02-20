'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { DragDropFile } from '@/components/DragDropFile'
import { Toaster } from 'sonner'
import { jsPDF } from 'jspdf'

interface ConversionSettings {
  pageSize: 'a4' | 'a3' | 'letter'
  orientation: 'portrait' | 'landscape'
  compression: 'none' | 'medium' | 'high'
}

interface PreviewImage {
  url: string
  name: string
  file: File
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [previews, setPreviews] = useState<PreviewImage[]>([])
  const { theme } = useTheme()
  const [settings, setSettings] = useState<ConversionSettings>({
    pageSize: 'a4',
    orientation: 'portrait',
    compression: 'medium'
  })

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = Array.from(files).filter(file => {
      const extension = file.name.toLowerCase().split('.').pop()
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
      return file.type.startsWith('image/') || validExtensions.includes(extension || '')
    })

    if (imageFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, GIF, WebP, or BMP)')
      return
    }

    setError(null)

    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          setPreviews(prev => [...prev, {
            url: reader.result as string,
            name: file.name,
            file: file
          }])
        }
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFileSelect = (files: File[]) => {
    console.log('Selected files:', files);
  }

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (previews.length === 0) {
      setError('Please select at least one image')
      return
    }
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      
      previews.forEach((preview) => {
        formData.append('file', preview.file)
      })

      Object.entries(settings).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Conversion failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setSuccess(true)
      setPreviews([]) // Clear previews after successful conversion
      setTimeout(() => setSuccess(false), 5000) // Hide success message after 5 seconds

    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to convert images')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConversion = async (files: File[]): Promise<Blob> => {
    const doc = new jsPDF({
      orientation: settings.orientation,
      unit: 'mm',
      format: settings.pageSize
    });

    try {
      for (let i = 0; i < files.length; i++) {
        if (i > 0) {
          doc.addPage();
        }

        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64);
          };
          reader.readAsDataURL(files[i]);
        });

        const img = await new Promise<HTMLImageElement>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.onerror = (error) => {
            console.error('Error loading image:', error);
            resolve(img);
          };
          img.src = base64Image;
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const imgRatio = img.width / img.height;
        const pageRatio = pageWidth / pageHeight;
        
        let finalWidth = pageWidth - 20;
        let finalHeight = finalWidth / imgRatio;
        
        if (finalHeight > pageHeight - 20) {
          finalHeight = pageHeight - 20;
          finalWidth = finalHeight * imgRatio;
        }
        
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        const imageQuality = settings.compression === 'high' ? 0.3 : 
                           settings.compression === 'medium' ? 0.6 : 0.9;

        doc.addImage(
          base64Image,
          'JPEG',
          x,
          y,
          finalWidth,
          finalHeight,
          `image-${i}`,
          'FAST',
          0,
          imageQuality
        );
      }

      return doc.output('blob');

    } catch (error) {
      console.error('PDF conversion error:', error);
      throw new Error('Failed to convert images to PDF');
    }
  }

  return (
    <main className="min-h-screen bg-secondary-light dark:bg-dark-bg text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 
          bg-gradient-to-r from-primary-red to-accent-pink dark:from-dark-magenta dark:to-dark-cyan 
          bg-clip-text text-transparent">
          Image to PDF Converter
        </h1>
        
        {/* Settings and Convert Button Section */}
        <div className="max-w-2xl mx-auto mb-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <select 
              value={settings.pageSize}
              onChange={(e) => setSettings({...settings, pageSize: e.target.value as 'a4' | 'a3' | 'letter'})}
              className="px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 
                border border-gray-300 dark:border-gray-700 
                text-gray-900 dark:text-gray-100 rounded-lg 
                focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]
                transition-colors duration-150"
            >
              <option value="a4">A4</option>
              <option value="a3">A3</option>
              <option value="letter">Letter</option>
            </select>

            <select 
              value={settings.orientation}
              onChange={(e) => setSettings({...settings, orientation: e.target.value as 'portrait' | 'landscape'})}
              className="px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 
                border border-gray-300 dark:border-gray-700 
                text-gray-900 dark:text-gray-100 rounded-lg 
                focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]
                transition-colors duration-150"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>

            <select 
              value={settings.compression}
              onChange={(e) => setSettings({...settings, compression: e.target.value as 'none' | 'medium' | 'high'})}
              className="px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 
                border border-gray-300 dark:border-gray-700 
                text-gray-900 dark:text-gray-100 rounded-lg 
                focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]
                transition-colors duration-150"
            >
              <option value="none">No Compression</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <DragDropFile 
          onFileSelect={handleFileSelect}
          onConvert={handleConversion}
        />
      </div>
      <Toaster />
    </main>
  )
}

