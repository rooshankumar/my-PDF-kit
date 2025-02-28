"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { BackToHomeButton } from "@/components/shared/BackToHomeButton"

interface ToolLayoutProps {
  children: ReactNode
  title: string
  description: string
  icon: ReactNode
}

export function ToolLayout({
  children,
  title,
  description,
  icon
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <BackToHomeButton />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-block p-3 rounded-lg bg-gray-50 mb-4">
              {icon}
            </div>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}