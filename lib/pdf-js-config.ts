
import * as PDFJS from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  // Use the correct path to the worker file in public directory
  PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export default PDFJS;
