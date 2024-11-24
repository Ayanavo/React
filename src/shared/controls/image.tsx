import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

function image() {
  const [isUploading, setIsUploading] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
        {isUploading ?
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        : <image width={64} height={64} className="object-cover" />}
      </div>
      <Button variant="outline" size="sm">
        Replace logo
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setIsUploading(true)}>
        Remove
      </Button>
    </div>
  );
}

export default image;
