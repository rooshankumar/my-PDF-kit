"use client"

import { useState } from "react"
import { ImageToPDF } from "@/components/image/ImageToPDF"
import { FileWithPreview } from "@/types/files"
import { Card } from "@/components/ui/card"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton" // Added import

export default function ImageToPDFPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  //const router = useRouter()  //Removed as not used

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <BackToHomeButton /> {/* Replaced Back button */}

      <div className="space-y-4 mb-6">
        <h1 className="text-3xl font-bold">Convert Images to PDF</h1>
        <p className="text-muted-foreground">
          Convert multiple images into a single PDF document
        </p>
      </div>

      <Card className="p-6">
        <ImageToPDF files={files} setFiles={setFiles} />
      </Card>
    </div>
  )
} 

//This CSS needs to be included in a global stylesheet (e.g., globals.css) or your main app CSS
@import url('https://fonts.googleapis.com/css?family=Nunito:400,600,700');

body{
  font-family: 'Nunito', sans-serif;
}

.a{color: #E7484F}
.b{color: #F68B1D}
.c{color: #FCED00}
.d{color: #009E4F}
.e{color: #00AAC3}
.f{color:  #732982}


.container{
  margin-top: 150px;
}

.text-center {
  text-align: center;
}

.rainbow-back-button{
  background-color: #343A40;
  border-radius: 4px;  
  color: #fff;
  cursor: pointer;
  padding: 8px 16px;
}

.rainbow-back-button:hover{
   background-image: linear-gradient(
      to right, 
      #E7484F,
      #F68B1D, 
      #FCED00,
      #009E4F,
      #00AAC3,
      #732982
    );
  animation:slidebg 2s linear infinite;
}

@keyframes slidebg {
  to {
    background-position:20vw;
  }
}

.tool-button:hover {
  background-color: #87CEEB; /* Sky blue */
}

.follow{
  margin-top: 40px;
}

.follow a{
  color: black;
  padding: 8px 16px;
  text-decoration: none;
}