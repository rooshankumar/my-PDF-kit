
'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
}

export default function SEO({
  title = "MyPDFKit - Free PDF Tools Online",
  description = "Merge, split, compress, and edit PDFs online for free with MyPDFKit.",
  keywords = "merge pdf, split pdf, pdf editor, compress pdf, pdf tools, online pdf converter",
  ogImage = "https://mypdfkit.netlify.app/preview.png",
  ogType = "website"
}: SEOProps) {
  const pathname = usePathname();
  const url = `https://mypdfkit.netlify.app${pathname}`;
  
  const pageType = pathname.includes('/blog') ? 'BlogPosting' : 'WebPage';
  
  // Generate rich structured data based on current page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": pageType === 'BlogPosting' ? 'BlogPosting' : 'WebSite',
    "name": title,
    "headline": title,
    "description": description,
    "url": url,
    "image": ogImage,
    "publisher": {
      "@type": "Organization",
      "name": "MyPDFKit",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mypdfkit.netlify.app/pdf-folder-logo.svg"
      }
    }
  };

  // Add additional schema for tools pages
  const toolSchema = pathname.includes('/pdf/') ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  } : null;

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      {toolSchema && (
        <Script id="tool-schema" type="application/ld+json">
          {JSON.stringify(toolSchema)}
        </Script>
      )}
      
      {/* FAQ Schema for homepage */}
      {pathname === '/' && (
        <Script id="faq-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is MyPDFKit free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, MyPDFKit's core PDF tools are completely free to use with no registration required."
                }
              },
              {
                "@type": "Question",
                "name": "Are my PDF files secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all files are processed in your browser and never uploaded to our servers, ensuring complete privacy."
                }
              },
              {
                "@type": "Question",
                "name": "Can I merge multiple PDF files?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can merge any number of PDF files into a single document with our merge tool."
                }
              }
            ]
          })}
        </Script>
      )}
    </>
  );
}
