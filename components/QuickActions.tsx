"use client"

import { Button } from "@/components/ui/button"
import { FileIcon, ImageIcon } from "lucide-react"
import Link from "next/link"

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      <Link href="/tools/pdf">
        <Button variant="outline" className="w-full">
          <FileIcon className="w-4 h-4 mr-2" />
          PDF Tools
        </Button>
      </Link>
      <Link href="/tools/image">
        <Button variant="outline" className="w-full">
          <ImageIcon className="w-4 h-4 mr-2" />
          Image Tools
        </Button>
      </Link>
    </div>
  )
}