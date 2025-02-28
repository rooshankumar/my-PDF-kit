
"use client";

import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';

// Setup for PDF.js in browser environment
export function setupPdfJs() {
  // Set worker path to use the worker file from public directory
  if (typeof window !== 'undefined') {
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
}

// Call setup when module is loaded (client-side only)
if (typeof window !== 'undefined') {
  setupPdfJs();
}

// Export pdfjs for use in other files
export const pdfjs = pdfjsLib;
