"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function QuickActions() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Compress PDF</h3>
              <p className="text-sm text-muted-foreground">
                Reduce file size while maintaining quality
              </p>
            </div>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Compress
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Split PDF</h3>
              <p className="text-sm text-muted-foreground">
                Split PDF into multiple files
              </p>
            </div>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Split
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}