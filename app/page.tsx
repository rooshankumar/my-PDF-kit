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
    <div className="container py-8 md:py-12">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8 text-center">
        <motion.h1 
          className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to My PDF Kit
        </motion.h1>
        <motion.p 
          className="max-w-[750px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Easy-to-use tools to convert, compress, and manipulate your PDFs and images. No registration required.
        </motion.p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={feature.href}>
              <Card className="p-6 hover:bg-muted/50 transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
