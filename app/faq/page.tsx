
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Helmet } from "react-helmet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQ() {
  const faqs = [
    { 
      question: "Is MyPDFKit free to use?", 
      answer: "Yes! MyPDFKit is completely free with no hidden costs. You can merge, split, and edit PDFs without limitations." 
    },
    { 
      question: "How secure is MyPDFKit?", 
      answer: "We prioritize your privacy! All uploaded files are deleted automatically after processing to ensure security." 
    },
    { 
      question: "Do I need to install software?", 
      answer: "No installation is required. MyPDFKit is an online tool that works on any device with a web browser." 
    },
    { 
      question: "Can I merge multiple PDFs at once?", 
      answer: "Yes, you can upload multiple PDFs and merge them instantly. There's no limit on the number of files." 
    },
    { 
      question: "Does MyPDFKit work on mobile devices?", 
      answer: "Yes! MyPDFKit is mobile-friendly and works seamlessly on smartphones and tablets." 
    },
    { 
      question: "What other features does MyPDFKit offer?", 
      answer: "Besides merging PDFs, MyPDFKit lets you split, compress, convert, and edit PDFs with ease." 
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet>
        <title>Frequently Asked Questions - MyPDFKit</title>
        <meta 
          name="description" 
          content="Find answers to common questions about MyPDFKit - the free online PDF editor and converter tool." 
        />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <Accordion type="single" collapsible className="mb-8">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-xl font-medium">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-base">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-8">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
