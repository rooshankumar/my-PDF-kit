import * as PDFJS from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
}

export default PDFJS;