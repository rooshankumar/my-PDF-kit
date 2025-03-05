
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Helmet } from "react-helmet"

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet>
        <title>How to Merge PDFs Online for Free – The Ultimate Guide</title>
        <meta 
          name="description" 
          content="Learn how to merge PDF files online for free using MyPDFKit. A fast, secure, and easy way to combine multiple PDFs into one document without software installation." 
        />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">How to Merge PDFs Online for Free – The Ultimate Guide</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">PDFs are widely used for sharing documents, but managing multiple files can be a hassle. Whether you're combining invoices, contracts, or study materials, a PDF merger tool simplifies the process. In this guide, we'll show you how to merge PDFs online for free using MyPDFKit.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Why Merge PDFs?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>✅ Better Organization: Combine multiple files into one structured document.</li>
          <li>✅ Easy Sharing: Send one file instead of multiple attachments.</li>
          <li>✅ Free & Fast: No downloads, no sign-ups, just instant merging.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How to Merge PDFs Using MyPDFKit?</h2>
        <p className="mb-4">Follow these simple steps to combine your PDFs:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>1️⃣ Visit MyPDFKit → Open mypdfkit.netlify.app in your browser.</li>
          <li>2️⃣ Upload PDFs → Drag & drop or select files manually.</li>
          <li>3️⃣ Arrange Pages → Reorder your documents if needed.</li>
          <li>4️⃣ Click Merge → Instantly combine your PDFs.</li>
          <li>5️⃣ Download File → Get your merged PDF in seconds.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Why Choose MyPDFKit?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>🚀 100% Free & Secure – No hidden fees, no ads.</li>
          <li>🔄 Fast Processing – Merges PDFs in just a few seconds.</li>
          <li>🔒 Privacy First – Files are automatically deleted after processing.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Final Thoughts</h2>
        <p>MyPDFKit makes merging PDFs effortless. Try it today and streamline your document workflow!</p>
      </section>

      <div className="mt-8">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
