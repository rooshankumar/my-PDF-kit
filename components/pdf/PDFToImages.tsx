import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { convertPDFToImages } from "@/lib/pdf/utils"
import { DragDropFile } from "@/components/DragDropFile"
import { FileWithPreview } from "@/types/files"
import { useToast } from "@/hooks/use-toast"
import JSZip from 'jszip'

export function PDFToImages() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleConvert = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      const images = await convertPDFToImages(files[0].file, setProgress)
      if (!images || images.length === 0) {
        throw new Error("No images were generated")
      }

      // Download all images in a zip file
      const zip = new JSZip()
      images.forEach((blob, index) => {
        zip.file(`page_${index + 1}.jpg`, blob)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const downloadUrl = URL.createObjectURL(zipBlob)

      // Create download link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${files[0].file.name.replace('.pdf', '')}_images.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: `PDF converted to ${images.length} images successfully`
      })

      // Download as zip if multiple pages
      if (images.length > 1) {
        const zip = new JSZip()
        images.forEach((blob, i) => {
          zip.file(`page-${i + 1}.jpg`, blob)
        })
        const content = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(content)
        const link = document.createElement('a')
        link.href = url
        link.download = `${files[0].file.name.replace('.pdf', '')}-images.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        const url = URL.createObjectURL(images[0])
        const link = document.createElement('a')
        link.href = url
        link.download = files[0].file.name.replace('.pdf', '.jpg')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      // Cleanup preview URLs
      // Assuming imageUrls is defined elsewhere and holds the URLs to revoke
      //  This part needs clarification in the original code or prompt.
      // imageUrls.forEach(URL.revokeObjectURL)

      toast({
        title: "Success",
        description: `Converted ${images.length} page${images.length === 1 ? '' : 's'} to images`
      })
    } catch (error) {
      console.error('Conversion failed:', error)
      toast({
        title: "Error",
        description: "Failed to convert PDF to images",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleFilesSelected = (newFiles: FileWithPreview[]) => {
    // Placeholder for potential additional file handling logic.
    console.log("Selected files:", newFiles);
  };

  return (
    <div className="space-y-6">
      <DragDropFile
        files={files}
        setFiles={setFiles}
        onFilesSelected={(newFiles) => {
          setFiles(newFiles);
          handleFilesSelected(newFiles);
        }}
        acceptedFileTypes={['application/pdf']}
        maxFileSize={50}
        showInBox={true}
        previewSize="small"
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <Button 
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Converting...' : 'Convert to Images'}
          </Button>

          {isProcessing && (
            <Progress value={progress} className="w-full" />
          )}
        </div>
      )}
    </div>
  )
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileWithPreview } from "@/types/files";
import { FileUpload } from "@/components/FileUpload";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { convertPDFToImages } from "@/lib/pdf/utils";
import JSZip from "jszip";
import { Download } from "lucide-react";

export function PDFToImages() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const images = await convertPDFToImages(files[0].file, {
        format: "jpeg",
        quality: 0.8,
        onProgress: setProgress,
      });

      if (!images || images.length === 0) {
        throw new Error("No images were generated");
      }

      // Create a zip file to contain all the images
      const zip = new JSZip();
      
      // Add each image to the zip file
      images.forEach((blob, index) => {
        zip.file(`page_${index + 1}.jpg`, blob);
      });
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create download link and trigger download
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${files[0].file.name.replace(".pdf", "")}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Success",
        description: `Converted ${images.length} page${images.length === 1 ? "" : "s"} to images`,
      });
    } catch (error) {
      console.error("Conversion failed:", error);
      toast({
        variant: "destructive",
        title: "Conversion failed",
        description: "There was an error converting the PDF to images. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xl mx-auto">
        <FileUpload
          value={files}
          onChange={setFiles}
          accept="application/pdf"
          maxFiles={1}
          maxSize={10 * 1024 * 1024} // 10MB
          disabled={isProcessing}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Selected PDF:</h3>
            <p className="text-sm text-muted-foreground">{files[0].file.name}</p>
          </div>

          <Button 
            className="w-full"
            disabled={isProcessing} 
            onClick={handleConvert}
          >
            {isProcessing ? (
              "Converting..."
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Convert to Images
              </>
            )}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Converting...</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
