
export interface FileWithPreview {
  file: File
  preview: string
  arrayBuffer: () => Promise<ArrayBuffer>
  name: string
  size: number
  type: string
}
