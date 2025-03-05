
import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found - MyPDFKit',
  description: 'The page you are looking for does not exist.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">404 - Page Not Found</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
