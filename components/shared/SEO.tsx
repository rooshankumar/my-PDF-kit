
'use client';

import { Helmet } from 'react-helmet';
import { usePathname } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  schema?: Record<string, any>;
}

export function SEO({
  title = 'My PDF Kit - Free Online PDF Tools',
  description = 'Free online PDF tools to merge, split, compress, convert PDFs. Easy to use, no installation required.',
  keywords = 'pdf tools, pdf editor, merge pdf, split pdf, compress pdf, convert pdf, my pdf kit',
  ogImage = '/pdf-folder-logo.svg',
  canonical,
  schema,
}: SEOProps) {
  const pathname = usePathname();
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://mypdfkit.com';
  const url = canonical || `${domain}${pathname}`;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${domain}${ogImage}`} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${domain}${ogImage}`} />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
