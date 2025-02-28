
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Setup for PDF.js in browser environment
export function setupPdfJs() {
  // Set worker path to use the worker file from public directory (must be copied there)
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

// Call setup when module is loaded (client-side only)
if (typeof window !== 'undefined') {
  setupPdfJs();
}
