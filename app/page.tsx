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
    title: "JPG to PDF Converter",
    description: "Convert and compress JPG, PNG images to PDF format with high quality",
    icon: <FileInput className="w-8 h-8 text-blue-500" />,
    href: "/jpg-to-pdf"
  },
  {
    title: "PDF to JPG Converter",
    description: "Convert PDF pages to compressed JPG images with excellent quality",
    icon: <FileOutput className="w-8 h-8 text-green-500" />,
    href: "/pdf-to-jpg"
  },
  {
    title: "PDF Compressor",
    description: "Reduce PDF file size while preserving quality and readability",
    icon: <ShrinkIcon className="w-8 h-8 text-purple-500" />,
    href: "/compress-pdf"
  },
  {
    title: "Image Compressor",
    description: "Compress JPG, PNG images with advanced quality control options",
    icon: <Images className="w-8 h-8 text-orange-500" />,
    href: "/compress-image"
  },
  {
    title: "PDF Merger",
    description: "Combine multiple PDFs into one document with perfect precision",
    icon: <MergeIcon className="w-8 h-8 text-red-500" />,
    href: "/merge-pdf"
  },
  {
    title: "PDF Splitter",
    description: "Split large PDF documents into individual pages or custom ranges",
    icon: <SplitIcon className="w-8 h-8 text-yellow-500" />,
    href: "/split-pdf"
  }
]

import { SEO } from '@/components/shared/SEO';

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MyPDFKit - Free PDF Editor, Merger & Compressor Tools",
  "url": "https://mypdfkit.netlify.com",
  "description": "Free online PDF tools to merge, split, compress, and convert PDFs & images. No installation required, works on all devices.",
  "operatingSystem": "All",
  "applicationCategory": "Utility",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mypdfkit.netlify.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// Placeholder components for Ad Banners.  Replace with actual components.
function AdBannerWide() {
  return <div>Wide Ad Banner</div>;
}

function AdBannerSecondary() {
  return <div>Secondary Ad Banner</div>;
}


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
      <Script
        strategy="afterInteractive"
        src="https://adsterra.com/serve/cpm/banner.js"
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

      <div className="my-8">
          <AdBannerWide />
          <AdBannerSecondary />
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