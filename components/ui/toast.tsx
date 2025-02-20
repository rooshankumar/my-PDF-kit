"use client"

import * as React from "react"
import { Loader2, X } from "lucide-react"

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'loading'
  onClose?: () => void
}

export function Toast({ message, type = 'loading', onClose }: ToastProps) {
  return (
    <div className={`
      fixed bottom-4 right-4 z-50
      flex items-center gap-2 px-4 py-2 rounded-lg
      text-sm font-medium shadow-lg
      transition-all duration-300
      ${type === 'success' ? 'bg-[#32CD32] text-white' : ''}
      ${type === 'error' ? 'bg-[#FF5733] text-white' : ''}
      ${type === 'loading' ? 'bg-gray-800 text-white' : ''}
    `}>
      {type === 'loading' && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
