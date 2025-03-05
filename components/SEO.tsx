
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

  return (
    <>
      <Script id="json-ld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "MyPDFKit",
          "url": "https://mypdfkit.netlify.app",
          "description": "Free online PDF tools to merge, split, and edit PDFs.",
          "publisher": {
            "@type": "Organization",
            "name": "MyPDFKit"
          }
        })}
      </Script>
    </>
  );
}
