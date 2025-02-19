"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ImagePreviewProps {
  files: File[]
}

export default function ImagePreview({ files }: ImagePreviewProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)

  useEffect(() => {
    const objectUrls = files.map((file) => URL.createObjectURL(file))
    setPreviews(objectUrls)
    setSelectedPreview(objectUrls[0] || null)

    return () => objectUrls.forEach(URL.revokeObjectURL)
  }, [files])

  return (
    <div>
      {selectedPreview && (
        <div className="mb-4 flex justify-center">
          <Image
            src={selectedPreview || "/placeholder.svg"}
            alt="Selected preview"
            width={400}
            height={400}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2 justify-center">
        {previews.map((preview, index) => (
          <Image
            key={index}
            src={preview || "/placeholder.svg"}
            alt={`Preview ${index + 1}`}
            width={80}
            height={80}
            onClick={() => setSelectedPreview(preview)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{ objectFit: "cover" }}
          />
        ))}
      </div>
    </div>
  )
}

