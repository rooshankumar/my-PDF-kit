"use client"

import { useState, useEffect, useRef } from 'react'
import { FileWithPreview } from '@/types/files'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Crop, 
  RotateCw, 
  RefreshCw,
  Scissors,
  ArrowLeft,
  ArrowRight,
  Save
} from 'lucide-react'
import { CloudStorage } from './CloudStorage'

interface ImageEnhancementProps {
  files: FileWithPreview[]
  onEnhanced: (files: FileWithPreview[]) => void
}

interface ImageState {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
  filter: 'none' | 'grayscale' | 'sepia' | 'vibrance' | 'vintage'
  rotation: number
  altText: string
  flip: {
    horizontal: boolean
    vertical: boolean
  }
  crop: {
    x: number
    y: number
    width: number
    height: number
  } | null
  history: ImageState[]
}

export function ImageEnhancement({ files, onEnhanced }: ImageEnhancementProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageStates, setImageStates] = useState<Record<number, ImageState>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (files.length > 0) {
      // Initialize state for each image
      const initialStates: Record<number, ImageState> = {}
      files.forEach((_, index) => {
        initialStates[index] = {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          sharpness: 0,
          filter: 'none',
          rotation: 0,
          altText: files[index].file.name,
          flip: { horizontal: false, vertical: false },
          crop: null,
          history: []
        }
      })
      setImageStates(initialStates)
    }
  }, [files])

  const applyChanges = async () => {
    if (!files[currentIndex] || !canvasRef.current) return
    
    setIsProcessing(true)
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      img.src = files[currentIndex].preview
      
      await new Promise((resolve) => {
        img.onload = () => {
          const state = imageStates[currentIndex]
          
          // Apply rotation and flips
          canvas.width = state.rotation % 180 === 0 ? img.width : img.height
          canvas.height = state.rotation % 180 === 0 ? img.height : img.width
          
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate((state.rotation * Math.PI) / 180)
          if (state.flip.horizontal) ctx.scale(-1, 1)
          if (state.flip.vertical) ctx.scale(1, -1)
          ctx.drawImage(img, -img.width / 2, -img.height / 2)
          ctx.restore()
          
          // Apply filters
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          // Apply adjustments
          for (let i = 0; i < data.length; i += 4) {
            // Brightness
            const brightness = (state.brightness - 100) / 100
            data[i] = data[i] + 255 * brightness
            data[i + 1] = data[i + 1] + 255 * brightness
            data[i + 2] = data[i + 2] + 255 * brightness
            
            // Contrast
            const contrast = (state.contrast - 100) * 2.55
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
            data[i] = factor * (data[i] - 128) + 128
            data[i + 1] = factor * (data[i + 1] - 128) + 128
            data[i + 2] = factor * (data[i + 2] - 128) + 128
            
            // Saturation
            const sat = state.saturation / 100
            const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2]
            data[i] = gray * (1 - sat) + data[i] * sat
            data[i + 1] = gray * (1 - sat) + data[i + 1] * sat
            data[i + 2] = gray * (1 - sat) + data[i + 2] * sat
          }
          
          // Apply special filters
          switch (state.filter) {
            case 'grayscale':
              for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
                data[i] = data[i + 1] = data[i + 2] = avg
              }
              break
            case 'sepia':
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2]
                data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189)
                data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168)
                data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131)
              }
              break
            case 'vibrance':
              for (let i = 0; i < data.length; i += 4) {
                const max = Math.max(data[i], data[i + 1], data[i + 2])
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
                const amt = ((Math.abs(max - avg) * 2) / 255) * 0.5
                data[i] += (max - data[i]) * amt
                data[i + 1] += (max - data[i + 1]) * amt
                data[i + 2] += (max - data[i + 2]) * amt
              }
              break
          }
          
          ctx.putImageData(imageData, 0, 0)
          resolve(null)
        }
      })

      // Create new file from canvas
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95)
      )
      
      const file = new File([blob], files[currentIndex].file.name, {
        type: 'image/jpeg'
      })
      
      const newFile: FileWithPreview = {
        file: file,
        preview: URL.createObjectURL(file)
      }
      
      const newFiles = [...files]
      newFiles[currentIndex] = newFile
      
      onEnhanced(newFiles)
      
      toast({
        title: "Changes Applied",
        description: "Image has been successfully enhanced",
      })
      
    } catch (error) {
      console.error('Error applying changes:', error)
      toast({
        title: "Error",
        description: "Failed to apply changes to the image",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const currentState = imageStates[currentIndex] || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpness: 0,
    filter: 'none',
    rotation: 0,
    altText: '',
    flip: { horizontal: false, vertical: false },
    crop: null,
    history: []
  }

  useEffect(() => {
    if (!files.length || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = files[currentIndex].preview
    img.alt = currentState.altText

    img.onload = () => {
      // Set canvas size
      canvas.width = img.width
      canvas.height = img.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Save context state
      ctx.save()

      // Apply rotation
      if (currentState.rotation) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((currentState.rotation * Math.PI) / 180)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
      }

      // Apply filters
      ctx.filter = `
        brightness(${currentState.brightness}%)
        contrast(${currentState.contrast}%)
        saturate(${currentState.saturation}%)
        ${currentState.filter !== 'none' ? `${currentState.filter}(100%)` : ''}
      `

      // Draw image
      if (currentState.crop) {
        const { x, y, width, height } = currentState.crop
        ctx.drawImage(img, x, y, width, height, 0, 0, canvas.width, canvas.height)
      } else {
        ctx.drawImage(img, 0, 0)
      }

      // Restore context state
      ctx.restore()
    }
  }, [files, currentIndex, currentState])

  const updateImageState = (updates: Partial<ImageState>) => {
    setImageStates(prev => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        ...updates
      }
    }))
  }

  const handleCrop = () => {
    if (!canvasRef.current) return
    updateImageState({ crop: { x: 0, y: 0, width: 100, height: 100 } })
  }

  const handleRotate = () => {
    updateImageState({
      rotation: ((currentState.rotation || 0) + 90) % 360
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updateImageState({ crop: { x, y, width: 0, height: 0 } })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentState.crop) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const crop = currentState.crop
    if (crop) {
      crop.width = x - crop.x
      crop.height = y - crop.y
      updateImageState({ crop })
    }
  }

  const handleMouseUp = () => {
    updateImageState({ crop: null })
  }

  const handleSave = async () => {
    await applyChanges()
  }

  if (!files.length) return null

  return (
    <div className="space-y-6">
      {/* Image Preview and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preview Panel */}
        <div className="lg:col-span-8 space-y-4">
          {/* Image Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {files[currentIndex] ? (
              <img
                src={files[currentIndex].preview}
                alt={files[currentIndex].file.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image selected
              </div>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {files.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {files.map((file, index) => (
                <button
                  key={file.preview}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden snap-start",
                    currentIndex === index && "ring-2 ring-primary"
                  )}
                >
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tool Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="default"
              onClick={() => updateImageState({
                brightness: 100,
                contrast: 100,
                saturation: 100,
                sharpness: 0,
                filter: 'none',
                rotation: 0,
                altText: files[currentIndex].file.name,
                flip: { horizontal: false, vertical: false },
                crop: null
              })}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="default"
              onClick={handleCrop}
              className="flex items-center gap-2"
            >
              <Crop className="h-4 w-4" />
              Crop
            </Button>
            <Button
              variant="default"
              onClick={handleRotate}
              className="flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Rotate
            </Button>
            <Button
              variant="default"
              onClick={() => updateImageState({ filter: 'grayscale' })}
              className="flex items-center gap-2"
            >
              <Scissors className="h-4 w-4" />
              Grayscale
            </Button>
          </div>

          {/* Tool Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Brightness</Label>
                <span className="text-sm text-muted-foreground">{currentState.brightness}%</span>
              </div>
              <Slider
                value={[currentState.brightness]}
                onValueChange={([value]) => updateImageState({ brightness: value })}
                min={0}
                max={200}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Contrast</Label>
                <span className="text-sm text-muted-foreground">{currentState.contrast}%</span>
              </div>
              <Slider
                value={[currentState.contrast]}
                onValueChange={([value]) => updateImageState({ contrast: value })}
                min={0}
                max={200}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Saturation</Label>
              <Slider
                value={[currentState.saturation]}
                onValueChange={([value]) => updateImageState({ saturation: value })}
                min={0}
                max={200}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Sharpness</Label>
              <Slider
                value={[currentState.sharpness]}
                onValueChange={([value]) => updateImageState({ sharpness: value })}
                min={-100}
                max={100}
                step={1}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
            <CloudStorage files={files} />
          </div>
        </div>
      </div>
    </div>
  )
}
