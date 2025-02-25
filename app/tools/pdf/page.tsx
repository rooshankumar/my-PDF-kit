"use client"

import { ToolLayout } from "@/components/shared/ToolLayout"
import { FileIcon } from "lucide-react"
import { DragDropFile } from "@/components/DragDropFile"

export default function PDFToolsPage() {
  return (
    <ToolLayout
      title="PDF Tools"
      description="Transform and manipulate your PDF files with ease"
      icon={<FileIcon className="w-8 h-8 text-primary" />}
    >
      <DragDropFile acceptedTypes=".pdf" />
    </ToolLayout>
  )
}