"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
  FileIcon,
  SplitIcon,
  MergeIcon,
  ImageIcon,
  ShrinkIcon,
  FileOutput,
  FileInput,
  Images
} from "lucide-react"
import Link from "next/link"
import { PDFToImages } from "@/components/pdf/PDFToImages"

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

const features: Feature[] = [
  {
    title: "JPG to PDF",
    description: "Convert and compress images to PDF format with ease",
    icon: <FileInput className="w-8 h-8 text-blue-500" />,
    href: "/image/to-pdf"
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages to compressed JPG images with high quality",
    icon: <FileOutput className="w-8 h-8 text-green-500" />,
    href: "/pdf/to-images"
  },
  {
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality and readability",
    icon: <ShrinkIcon className="w-8 h-8 text-purple-500" />,
    href: "/pdf/compress"
  },
  {
    title: "Compress Images",
    description: "Compress JPG, PNG, JPEG images with quality control and flexibility",
    icon: <Images className="w-8 h-8 text-orange-500" />,
    href: "/image/compress"
  },
  {
    title: "Merge PDFs",
    description: "Combine multiple PDFs into one document with ease and precision",
    icon: <MergeIcon className="w-8 h-8 text-red-500" />,
    href: "/pdf/merge"
  },
  {
    title: "Split PDF",
    description: "Split large PDF documents into smaller files by pages",
    icon: <SplitIcon className="w-8 h-8 text-yellow-500" />,
    href: "/pdf/split"
  }
]

export default function HomePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Convert PDF to Images
      </h1>
      <div className="max-w-xl mx-auto">
        <PDFToImages />
      </div>
    </div>
  )
}
