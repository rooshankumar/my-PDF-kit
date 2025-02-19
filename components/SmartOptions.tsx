import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SmartOptionsProps {
  conversionType: "to-pdf" | "to-image" | null
  compressionLevel: "low" | "perfect" | "high"
  setCompressionLevel: (value: "low" | "perfect" | "high") => void
}

export default function SmartOptions({ conversionType, compressionLevel, setCompressionLevel }: SmartOptionsProps) {
  return (
    <div className="space-y-4">
      {conversionType === "to-image" && (
        <div className="space-y-2">
          <Label htmlFor="image-format">Image Format</Label>
          <Select>
            <SelectTrigger id="image-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Compression Level</Label>
        <RadioGroup value={compressionLevel} onValueChange={setCompressionLevel}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low">Low</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="perfect" id="perfect" />
            <Label htmlFor="perfect">Perfect</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high">High</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

