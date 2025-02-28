
import * as PDFJS from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  // Use the local worker file from public directory
  PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export default PDFJS;
