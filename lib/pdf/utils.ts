"use client";

import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { pdfjs } from '@/lib/pdf-js-config';

// Format bytes to human-readable format
export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Convert PDF to images
export const convertPDFToImages = async (
  file: File,
  progressCallback?: (progress: number) => void,
  format: string = 'png',
  quality: number = 90
): Promise<Blob[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load the PDF document using PDF.js
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    const numPages = pdfDocument.numPages;
    const imageBlobs: Blob[] = [];

    for (let i = 1; i <= numPages; i++) {
      // Update progress
      if (progressCallback) {
        progressCallback((i / numPages) * 100);
      }

      // Get the page
      const page = await pdfDocument.getPage(i);

      // Determine viewport scale (adjust as needed for desired image size)
      const viewport = page.getViewport({ scale: 2.0 });

      // Create a canvas element to render the page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions to match the viewport
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the page to the canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert canvas to blob of specified format
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(new Blob([])); // Fallback empty blob
          },
          `image/${format}`,
          quality / 100
        );
      });

      imageBlobs.push(blob);
    }

    return imageBlobs;
  } catch (error) {
    console.error('PDF to Images conversion error:', error);
    throw error;
  }
};

// Helper function to download a blob
export const downloadBlob = async (blob: Blob, filename: string): Promise<void> => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Create a zip file from multiple blobs
export const createZipFromBlobs = async (
  blobs: Blob[],
  options: {
    filename: string;
    format: string;
    autoDownload?: boolean;
  }
): Promise<Blob> => {
  const zip = new JSZip();

  blobs.forEach((blob, index) => {
    zip.file(`${options.filename}-page-${index + 1}.${options.format}`, blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  if (options.autoDownload) {
    await downloadBlob(zipBlob, `${options.filename}.zip`);
  }

  return zipBlob;
};

// PDF Compression options interface
interface PDFCompressionOptions {
  useObjectStreams: boolean;
  objectStreamMaxLength?: number;
}

// Compress PDF function
export const compressPDF = async (
  file: File,
  options?: PDFCompressionOptions
): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Use default compression options if none provided
  const compressionOptions = options || { 
    useObjectStreams: true,
    objectStreamMaxLength: 100
  };

  return await pdfDoc.save(compressionOptions);
};

interface PDFCompressionOptions2 {
  useObjectStreams: boolean
  addDefaultPage: boolean
  preservePDFFormFields: boolean
  compress: boolean
  imageQuality: number
  compressImages: boolean
}

async function getOptimalCompression(pdfDoc: PDFDocument, originalSize: number): Promise<Uint8Array> {
  const compressionLevels = [
    { quality: 0.9, compress: true },
    { quality: 0.7, compress: true },
    { quality: 0.5, compress: true },
    { quality: 0.3, compress: true }
  ]

  let bestBytes: Uint8Array | null = null
  let bestSize = originalSize

  for (const level of compressionLevels) {
    const options: PDFCompressionOptions2 = {
      useObjectStreams: true,
      addDefaultPage: false,
      preservePDFFormFields: true,
      compress: true,
      imageQuality: level.quality,
      compressImages: true
    }

    const bytes = await pdfDoc.save(options)
    if (bytes.length < bestSize) {
      bestBytes = bytes
      bestSize = bytes.length
    }

    // If we've achieved good compression, stop trying
    if (bestSize < originalSize * 0.7) {
      break
    }
  }

  return bestBytes || await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false
  })
}

export const splitPDFByPages = async (
  file: File,
  pages: number[]
): Promise<Blob[]> => {
  let sourcePdfDoc: PDFDocument | null = null;
  const results: Blob[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    sourcePdfDoc = await PDFDocument.load(arrayBuffer);

    if (!sourcePdfDoc || sourcePdfDoc.getPageCount() === 0) {
      throw new Error('Invalid or empty PDF document');
    }

    for (const pageNum of pages) {
      if (pageNum < 1 || pageNum > sourcePdfDoc.getPageCount()) {
        throw new Error(`Invalid page number: ${pageNum}`);
      }

      const newPdfDoc = await PDFDocument.create();
      const [page] = await newPdfDoc.copyPages(sourcePdfDoc, [pageNum - 1]);
      newPdfDoc.addPage(page);
      const pdfBytes = await newPdfDoc.save();
      results.push(new Blob([pdfBytes], { type: 'application/pdf' }));

      // Clean up individual split document
      (newPdfDoc as any) = null;
    }
    return results
  } catch (error) {
    console.error("Error splitting PDF:", error);
    throw error;
  }
};

export async function mergePDFs(files: File[], onProgress?: (progress: number) => void): Promise<Blob> {
  // Merge implementation
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices())
    pages.forEach(page => pdfDoc.addPage(page))
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}