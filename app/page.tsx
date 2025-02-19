'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

interface ConversionOptions {
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
  const [isDragging, setIsDragging] = useState(false)
  const { theme } = useTheme()
  const [options, setOptions] = useState<ConversionOptions>({
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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }, [isDragging])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only set isDragging to false if we're leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const items = e.dataTransfer.items
    const files: File[] = []
    
    if (items) {
      [...items].forEach(item => {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      })
    }
    
    handleFiles(files)
  }, [handleFiles])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }, [handleFiles])

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

      Object.entries(options).forEach(([key, value]) => {
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            PDKit
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Convert your images to PDF
          </p>
        </div>

        {success && (
          <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-emerald-800 dark:text-emerald-200">
              PDF successfully created and downloaded
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`relative rounded-xl border-2 border-dashed p-8 transition-all duration-150
              ${isDragging 
                ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10' 
                : 'border-gray-300 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500'}
              ${previews.length > 0 ? 'pb-4' : 'pb-8'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-violet-50/80 dark:bg-violet-900/50 rounded-lg flex items-center justify-center transition-all duration-150 backdrop-blur-sm">
                <p className="text-violet-600 dark:text-violet-300 text-sm font-medium">
                  Drop images here
                </p>
              </div>
            )}
            
            <div className="flex flex-col items-center space-y-4">
              {previews.length > 0 && (
                <div className="grid grid-cols-8 gap-2 w-full mb-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={preview.url}
                          alt={preview.name}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          aria-label="Remove image"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-center space-y-2">
                <input 
                  type="file" 
                  id="file-input"
                  name="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label 
                  htmlFor="file-input"
                  className="cursor-pointer inline-flex items-center px-6 py-2.5 rounded-full
                    text-white bg-gradient-to-r from-violet-600 to-indigo-600 
                    dark:from-violet-500 dark:to-indigo-500
                    hover:from-violet-700 hover:to-indigo-700
                    dark:hover:from-violet-600 dark:hover:to-indigo-600
                    transition-all duration-200 font-medium text-sm
                    shadow-[0_4px_14px_rgba(79,70,229,0.2)]
                    hover:shadow-[0_6px_20px_rgba(79,70,229,0.3)]
                    active:scale-95"
                >
                  Choose Images
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  or drag and drop
                </p>
                {previews.length > 0 && (
                  <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                    {previews.length} {previews.length === 1 ? 'image' : 'images'} selected
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {['pageSize', 'orientation', 'compression'].map((option) => (
              <select
                key={option}
                value={options[option as keyof ConversionOptions]}
                onChange={(e) => setOptions(prev => ({ ...prev, [option]: e.target.value }))}
                className="px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 
                  border border-gray-300 dark:border-gray-700 
                  text-gray-900 dark:text-gray-100 rounded-lg 
                  focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400
                  transition-colors duration-150"
              >
                {option === 'pageSize' && (
                  <>
                    <option value="a4">A4</option>
                    <option value="a3">A3</option>
                    <option value="letter">Letter</option>
                  </>
                )}
                {option === 'orientation' && (
                  <>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </>
                )}
                {option === 'compression' && (
                  <>
                    <option value="none">No Compression</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </>
                )}
              </select>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || previews.length === 0}
            className="w-full py-3.5 text-sm font-medium text-white
              bg-gradient-to-r from-violet-600 to-indigo-600 
              dark:from-violet-500 dark:to-indigo-500
              hover:from-violet-700 hover:to-indigo-700
              dark:hover:from-violet-600 dark:hover:to-indigo-600
              disabled:opacity-50 disabled:cursor-not-allowed rounded-lg
              transition-all duration-200 transform hover:scale-[0.99]"
          >
            {isLoading 
              ? 'Converting...' 
              : `Convert ${previews.length} ${previews.length === 1 ? 'Image' : 'Images'} to PDF`
            }
          </button>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

