import * as JSZip from 'jszip'

export interface DownloadOptions {
  filename: string
  format?: string
  quality?: number
  autoDownload?: boolean
}

export const downloadBlob = (blob: Blob, fileName: string) => {
  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob)
  
  // Create a temporary link element
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  
  // Trigger the download
  link.click()
  
  // Clean up
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export async function createZipFromBlobs(blobs: Blob[], options: DownloadOptions) {
  const zip = new JSZip()
  
  blobs.forEach((blob, index) => {
    const filename = options.format
      ? `${options.filename}-${index + 1}.${options.format}`
      : `${options.filename}-${index + 1}`
    zip.file(filename, blob)
  })

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  return downloadBlob(zipBlob, `${options.filename}.zip`)
}

export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

export const compressImage = async (
  file: File,
  format: string,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        `image/${format}`,
        quality / 100
      )
      
      URL.revokeObjectURL(img.src)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
  })
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
