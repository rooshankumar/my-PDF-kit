
import * as PDFJS from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  // Use the local worker file instead of CDN
  PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export default PDFJS;
