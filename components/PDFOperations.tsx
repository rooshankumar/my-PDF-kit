"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/toast"
import { FileWithPreview } from "@/types/files"
import { downloadBlob, createZipFromBlobs } from "@/lib/file-utils"
import { splitPDF, compressPDF, convertPDFToImages } from "@/lib/pdf-utils"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/FileUpload"
import { ImagePreview } from "@/components/ImagePreview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBytes } from "@/lib/file-utils"
import { Input } from "@/components/ui/input"

interface PDFOperationsProps {
  defaultMode?: "split" | "compress" | "convert"
}

export function PDFOperations({ defaultMode = "compress" }: PDFOperationsProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pageRange, setPageRange] = useState("")
  const { toast } = useToast()

  const handleSplit = async () => {
    if (!files.length || !pageRange) return
    setIsProcessing(true)
    setProgress(0)

    try {
      // Parse page range (e.g., "1-3,5,7-9")
      const pages = pageRange.split(',').flatMap(range => {
        const [start, end] = range.trim().split('-').map(num => parseInt(num))
        if (!end) return [start]
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      }).filter(page => !isNaN(page))

      const splitBlobs = await splitPDF(files[0].file, pages)
      await createZipFromBlobs(splitBlobs, {
        filename: 'split-pdf',
        format: 'pdf',
        autoDownload: true
      })

      toast({
        title: "Success",
        description: `Split PDF into ${splitBlobs.length} parts`
      })
    } catch (error) {
      console.error("Split failed:", error)
      toast({
        title: "Error",
        description: "Failed to split PDF. Please check the page range format.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleCompress = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      const compressedBlob = await compressPDF(
        files[0].file,
        quality >= 80 ? 'high' : quality >= 50 ? 'medium' : 'low'
      )
      await downloadBlob(compressedBlob, {
        filename: `compressed-${files[0].file.name}`,
        autoDownload: true
      })

      const originalSize = files[0].file.size
      const compressedSize = compressedBlob.size
      const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)

      toast({
        title: "Success",
        description: `Compressed PDF from ${formatBytes(originalSize)} to ${formatBytes(compressedSize)} (${reduction}% reduction)`
      })
    } catch (error) {
      console.error("Compression failed:", error)
      toast({
        title: "Error",
        description: "Failed to compress PDF",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleConvertToImages = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setProgress(0)

    try {
      const imageBlobs = await convertPDFToImages(
        files[0].file,
        format,
        quality,
        setProgress
      )

      if (imageBlobs.length === 1) {
        await downloadBlob(imageBlobs[0], {
          filename: files[0].file.name.replace('.pdf', ''),
          format,
          autoDownload: true
        })
      } else {
        await createZipFromBlobs(imageBlobs, {
          filename: files[0].file.name.replace('.pdf', ''),
          format,
          autoDownload: true
        })
      }

      toast({
        title: "Success",
        description: `Converted PDF to ${imageBlobs.length} ${format.toUpperCase()} image${imageBlobs.length === 1 ? "" : "s"}`
      })
    } catch (error) {
      console.error("Conversion failed:", error)
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

  return (
    <div className="container py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileUpload
            files={files}
            setFiles={setFiles}
            accept={["application/pdf"]}
            maxFiles={1}
            multiple={false}
          />
          
          {files.length > 0 && (
            <ImagePreview
              files={files}
              setFiles={setFiles}
              canReorder={false}
              previewSize="medium"
            />
          )}
        </div>

        <div>
          <Tabs defaultValue={defaultMode}>
            <TabsList className="w-full">
              <TabsTrigger value="split" className="flex-1">Split</TabsTrigger>
              <TabsTrigger value="compress" className="flex-1">Compress</TabsTrigger>
              <TabsTrigger value="convert" className="flex-1">Convert</TabsTrigger>
            </TabsList>

            <TabsContent value="split">
              <Card>
                <CardHeader>
                  <CardTitle>Split PDF</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Page Range</Label>
                    <Input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g., 1-3,5,7-9"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter page numbers or ranges separated by commas
                    </p>
                  </div>

                  <Button
                    onClick={handleSplit}
                    disabled={isProcessing || !files.length || !pageRange}
                    className="w-full"
                  >
                    {isProcessing ? "Splitting..." : "Split & Download"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compress">
              <Card>
                <CardHeader>
                  <CardTitle>Compress PDF</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Quality</Label>
                      <span className="text-sm text-muted-foreground">{quality}%</span>
                    </div>
                    <Slider
                      value={[quality]}
                      onValueChange={([value]) => setQuality(value)}
                      min={1}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>

                  <Button
                    onClick={handleCompress}
                    disabled={isProcessing || !files.length}
                    className="w-full"
                  >
                    {isProcessing ? "Compressing..." : "Compress & Download"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="convert">
              <Card>
                <CardHeader>
                  <CardTitle>Convert to Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={format} onValueChange={(value: "jpeg" | "png") => setFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Quality</Label>
                      <span className="text-sm text-muted-foreground">{quality}%</span>
                    </div>
                    <Slider
                      value={[quality]}
                      onValueChange={([value]) => setQuality(value)}
                      min={1}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>

                  {progress > 0 && progress < 100 && (
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}

                  <Button
                    onClick={handleConvertToImages}
                    disabled={isProcessing || !files.length}
                    className="w-full"
                  >
                    {isProcessing ? "Converting..." : `Convert to ${format.toUpperCase()}`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
