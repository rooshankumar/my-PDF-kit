import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewGridProps {
  files: File[]
  onRemove: (id: string) => void
}

export default function PreviewGrid({ files, onRemove }: PreviewGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <div key={file.name} className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            {file.type.startsWith("image/") ? (
              <Image
                src={URL.createObjectURL(file) || "/placeholder.svg"}
                alt={file.name}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-4xl">PDF</span>
              </div>
            )}
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(file.name)}
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="mt-1 text-xs truncate">{file.name}</p>
        </div>
      ))}
    </div>
  )
}

