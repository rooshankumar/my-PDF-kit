
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { convertPDFToImages, downloadBlob, createZipFromBlobs } from "@/lib/pdf/utils";
import { DragDropFile } from "@/components/DragDropFile";
import { FileWithPreview } from "@/types/files";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PDFToImagesProps {
  files: FileWithPreview[];
  setFiles: (files: FileWithPreview[]) => void;
}

export function PDFToImages({ files, setFiles }: PDFToImagesProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<string>("jpg");
  const [quality, setQuality] = useState<number>(80);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const images = await convertPDFToImages(
        files[0].file, 
        (progress) => setProgress(progress),
        format,
        quality
      );
      
      if (!images || images.length === 0) {
        throw new Error("No images were generated");
      }

      if (images.length === 1) {
        // If there's only one image, download it directly
        await downloadBlob(
          images[0], 
          `${files[0].file.name.replace('.pdf', '')}.${format}`
        );
      } else {
        // Create a zip file for multiple images
        await createZipFromBlobs(images, {
          filename: files[0].file.name.replace('.pdf', ''),
          format,
          autoDownload: true
        });
      }

      toast({
        title: "Success",
        description: `PDF converted to ${images.length} ${format.toUpperCase()} image${images.length === 1 ? "" : "s"}`
      });
    } catch (error) {
      console.error('Conversion failed:', error);
      toast({
        title: "Error",
        description: "Failed to convert PDF to images",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <DragDropFile
        files={files}
        setFiles={setFiles}
        onFilesSelected={(newFiles) => setFiles(newFiles)}
        acceptedFileTypes={['application/pdf']}
        maxFileSize={50}
        showInBox={true}
        previewSize="small"
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Image Format</Label>
              <Select
                value={format}
                onValueChange={(value) => setFormat(value)}
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quality">Quality: {quality}%</Label>
              <Slider
                id="quality"
                min={10}
                max={100}
                step={5}
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
              />
            </div>
          </div>

          <Button 
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Converting...' : 'Convert to Images'}
          </Button>
          
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
