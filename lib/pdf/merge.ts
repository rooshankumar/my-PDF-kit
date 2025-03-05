
import { PDFDocument } from 'pdf-lib';

export async function mergePDFs(
  pdfFiles: File[],
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Sort files if needed by filename
    const sortedFiles = [...pdfFiles];
    
    let processedFiles = 0;
    
    // Process each PDF file
    for (const file of sortedFiles) {
      // Read the file
      const fileData = await readFileAsArrayBuffer(file);
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(fileData);
      
      // Get all pages from the document
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      
      // Add each page to the new document
      for (const page of pages) {
        mergedPdf.addPage(page);
      }
      
      // Update progress
      processedFiles++;
      if (onProgress) {
        onProgress((processedFiles / sortedFiles.length) * 100);
      }
    }
    
    // Serialize the merged PDF document
    const mergedPdfBytes = await mergedPdf.save();
    
    // Complete progress
    if (onProgress) {
      onProgress(100);
    }
    
    return mergedPdfBytes;
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('Failed to merge PDF files');
  }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
