
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function BackToHomeButton() {
  return (
    <Link href="/" className="inline-block mb-6">
      <button className="flex items-center rainbow-back-button rainbow-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </button>
    </Link>
  )
}
