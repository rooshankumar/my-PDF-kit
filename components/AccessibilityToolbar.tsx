"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Keyboard, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Tooltip from 'path/to/tooltip/component'
import { TooltipProps } from 'path/to/tooltip/props/file'

export default function AccessibilityToolbar() {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const resetTheme = () => {
    setTheme("light")
  }

  return (
    <TooltipProvider>
      <div className="flex justify-end space-x-2">
        <Tooltip content={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </Tooltip>
        <Tooltip content="Reset to default theme">
          <Button variant="outline" size="icon" onClick={resetTheme}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Tooltip>
        <Dialog>
          <Tooltip content="Keyboard shortcuts">
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Keyboard className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                <ul className="list-disc list-inside">
                  <li>Ctrl + O: Open file dialog</li>
                  <li>Ctrl + Enter: Start conversion</li>
                  <li>Ctrl + D: Download converted file</li>
                  <li>Ctrl + Shift + T: Toggle theme</li>
                </ul>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

