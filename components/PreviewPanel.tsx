import { FileIcon } from "lucide-react"

interface PreviewPanelProps {
  files: File[]
}

export default function PreviewPanel({ files }: PreviewPanelProps) {
  return (
    <div className="w-64 bg-muted p-4 border-r">
      <h3 className="font-semibold mb-4">Selected Files</h3>
      {files.map((file, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <FileIcon className="h-5 w-5" />
          <span className="text-sm truncate">{file.name}</span>
        </div>
      ))}
    </div>
  )
}

