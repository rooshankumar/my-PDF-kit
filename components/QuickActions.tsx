"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ImageIcon,
  FileIcon,
  ShrinkIcon,
  ArrowLeftRight,
  FileOutput,
  Combine
} from "lucide-react"
import Link from "next/link"

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

const quickActions: QuickAction[] = [
  {
    title: "Compress Image",
    description: "Reduce file size while preserving quality",
    icon: <ShrinkIcon className="w-6 h-6" />,
    href: "/image/compress"
  },
  {
    title: "Resize Image",
    description: "Change dimensions while maintaining aspect ratio",
    icon: <ArrowLeftRight className="w-6 h-6" />,
    href: "/image/resize"
  },
  {
    title: "Convert Format",
    description: "Convert to JPEG, PNG, or WebP",
    icon: <ImageIcon className="w-6 h-6" />,
    href: "/image/convert"
  },
  {
    title: "Convert to PDF",
    description: "Convert image to PDF document",
    icon: <FileOutput className="w-6 h-6" />,
    href: "/image/to-pdf"
  },
  {
    title: "Merge to PDF",
    description: "Combine multiple images into a single PDF",
    icon: <Combine className="w-6 h-6" />,
    href: "/image/merge-pdf"
  }
]

const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quickActions.map((action) => (
        <Link key={action.title} href={action.href}>
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {action.icon}
              </div>
              <div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}


export default QuickActions;
