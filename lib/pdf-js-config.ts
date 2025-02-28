
import * as PDFJS from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  // Use the correct version from the pdfjs-dist package
  const pdfjsVersion = '2.16.105'; // Match this to your installed version
  PDFJS.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
}

export default PDFJS;
