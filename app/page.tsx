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
import Script from "next/script" // Import Next.js Script component

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

import { SEO } from '@/components/shared/SEO';

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "My PDF Kit",
  "url": "https://mypdfkit.netlify.com",
  "description": "Free online PDF tools to merge, split, compress, convert PDFs. Easy to use, no installation required.",
  "operatingSystem": "All",
  "applicationCategory": "Utility"
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <SEO 
        title="My PDF Kit - Free Online PDF Tools"
        description="Free online PDF tools to merge, split, compress, convert PDFs. Easy to use, no installation required."
        schema={homeSchema}
      />

      {/* Inject External Scripts */}
      <Script
        strategy="afterInteractive"
        src="//pl25991753.effectiveratecpm.com/e9/a1/55/e9a155569b7769daf0102e8639509723.js"
      />
      <Script
        strategy="afterInteractive"
        src="//www.highperformanceformat.com/4d666fdf93d80a362fcea5a1cec89670/invoke.js"
      />

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Your All-in-One PDF Toolkit
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Convert, compress, and manage your PDFs and images with our powerful, easy-to-use tools.
        </p>
      </section>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Link href={feature.href} key={index}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full tool-card-hover">
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Benefits Section */}
      <section className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-8">Why Choose Our PDF Tools?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3">Fast & Secure</h3>
            <p className="text-gray-600 dark:text-gray-300">Process your files quickly with our secure, browser-based tools</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3">Easy to Use</h3>
            <p className="text-gray-600 dark:text-gray-300">Simple interface designed for the best user experience</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-3">Free to Use</h3>
            <p className="text-gray-600 dark:text-gray-300">Access our core features without any cost</p>
          </div>
        </div>
      </section>
    </div>
  )
}
