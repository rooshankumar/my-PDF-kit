"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import FileUpload from "./FileUpload"
import ImagePreview from "./ImagePreview"

export default function JPGToPDFConverter() {
  const [files, setFiles] = useState<File[]>([])
  const [orientation, setOrientation] = useState("portrait")
  const [pageSize, setPageSize] = useState("A4")
  const [margin, setMargin] = useState("none")
  const [merge, setMerge] = useState(true)
  const [status, setStatus] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus("Converting...")

    const formData = new FormData()
    files.forEach((file) => formData.append("images", file))
    formData.append("orientation", orientation)
    formData.append("pageSize", pageSize)
    formData.append("margin", margin)
    formData.append("merge", merge.toString())

    try {
      const response = await fetch("/api/convert", { method: "POST", body: formData })
      if (!response.ok) throw new Error(await response.text())
      const result = await response.json()
      setPdfUrl(result.pdfUrl)
      setStatus("Conversion successful!")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "An error occurred.")
    }
  }

  const resetForm = () => {
    setFiles([])
    setOrientation("portrait")
    setPageSize("A4")
    setMargin("none")
    setMerge(true)
    setStatus("")
    setPdfUrl("")
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl">
      <Card className="w-full md:w-1/3">
        <CardHeader>
          <CardTitle>JPG to PDF Converter</CardTitle>
          <CardDescription>Convert your JPG images to PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUpload files={files} setFiles={setFiles} />

            <div className="space-y-2">
              <Label>Page Orientation</Label>
              <RadioGroup value={orientation} onValueChange={setOrientation}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Portrait</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Landscape</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageSize">Page Size</Label>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (297x210 mm)</SelectItem>
                  <SelectItem value="Letter">Letter (8.5x11 in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin">Margin</Label>
              <Select value={margin} onValueChange={setMargin}>
                <SelectTrigger>
                  <SelectValue placeholder="Select margin size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No margin</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="big">Big</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="merge" checked={merge} onCheckedChange={setMerge} />
              <Label htmlFor="merge">Merge all images into one PDF</Label>
            </div>

            {status && <p className="text-center text-sm text-muted-foreground">{status}</p>}

            <Button type="submit" className="w-full">
              Convert to PDF
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={resetForm}>
              Reset
            </Button>
          </form>

          {pdfUrl && (
            <a
              href={pdfUrl}
              className="block mt-4 text-center bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="w-full md:w-2/3">
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ImagePreview files={files} />
        </CardContent>
      </Card>
    </div>
  )
}

