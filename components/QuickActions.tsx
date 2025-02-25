
'use client';

import React from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface QuickActionsProps {
  onQuickConvert: (mode: 'compress' | 'split' | 'merge') => void;
  fileCount: number;
  fileSize: string;
  isProcessing: boolean;
}

export function QuickActions({ onQuickConvert, fileCount, fileSize, isProcessing }: QuickActionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Compress PDF</h3>
          <p className="text-sm text-muted-foreground">
            Reduce file size while maintaining quality
            {fileSize && <span className="block text-xs mt-1">{fileSize}</span>}
          </p>
        </div>
        <Button 
          onClick={() => onQuickConvert('compress')}
          disabled={fileCount === 0 || isProcessing}
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Convert & Download
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Split PDF</h3>
          <p className="text-sm text-muted-foreground">
            Split PDF into pages or ranges
            {fileCount > 0 && <span className="block text-xs mt-1">Advanced splitting options available below</span>}
          </p>
        </div>
        <Button 
          onClick={() => onQuickConvert('split')}
          disabled={fileCount === 0 || isProcessing}
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Quick Split
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Merge PDFs</h3>
          <p className="text-sm text-muted-foreground">
            Combine multiple PDFs into one
            {fileCount > 1 && <span className="block text-xs mt-1">Merging {fileCount} files</span>}
          </p>
        </div>
        <Button 
          onClick={() => onQuickConvert('merge')}
          disabled={fileCount < 2 || isProcessing}
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Merge & Download
        </Button>
      </div>
    </div>
  );
}
