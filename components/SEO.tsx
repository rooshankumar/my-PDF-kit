import Head from 'next/head'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  schema?: any;
}

export function SEO({
  title = "Free PDF Tools Online - MyPDFKit",
  description = "Convert, compress, merge, split and edit PDFs online for free with MyPDFKit's easy-to-use PDF tools.",
  keywords = "merge pdf, split pdf, pdf editor, compress pdf, pdf tools, online pdf converter, free pdf tools, pdf merger",
  ogImage = "https://mypdfkit.netlify.app/preview.png",
  ogType = "website",
  schema
}: SEOProps) {
  const pathname = usePathname();
  const url = `https://mypdfkit.netlify.app${pathname}`;

  const pageType = pathname?.includes('/blog') ? 'BlogPosting' : 'WebPage';

  // Generate rich structured data based on current page
  const defaultSchema = {
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

  // Tool-specific schema for better SEO
  const toolSchema = pathname?.includes('/tools/') || pathname?.includes('/pdf/') || pathname?.includes('/image/') ? {
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

  const finalSchema = schema || (toolSchema || defaultSchema);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={ogImage} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* Canonical URL */}
        <link rel="canonical" href={url} />

        {/* Structured Data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(finalSchema) }}
        />
      </Head>
    </>
  );
}

export default SEO;