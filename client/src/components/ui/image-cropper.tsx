import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Save, SquareX } from "lucide-react";
import React, { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type ImageCropperProps = {
  open: boolean;
  image: string;
  aspect?: number;
  onClose: () => void;
  onCropped: (dataUrl: string) => void;
};

function dataURLToImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function getCroppedDataUrl(imageSrc: string, crop: Area): Promise<string> {
  const image = await dataURLToImage(imageSrc);
  const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  canvas.width = Math.floor(crop.width * pixelRatio);
  canvas.height = Math.floor(crop.height * pixelRatio);
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}

const ImageCropper = ({ open, image, aspect = 1, onClose, onCropped }: ImageCropperProps) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => setCroppedAreaPixels(areaPx), []);

  const handleConfirm = useCallback(async () => {
    if (!image || !croppedAreaPixels) return;
    try {
      const dataUrl = await getCroppedDataUrl(image, croppedAreaPixels);
      onCropped(dataUrl);
    } catch (e) {
      console.error("[v0] Cropping failed:", e);
    }
  }, [image, croppedAreaPixels, onCropped]);

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-[90vw] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop your image</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[50vh] bg-background/50 rounded-md overflow-hidden">
          {image && (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
              restrictPosition={false}
              objectFit="contain"
            />
          )}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Label className="min-w-12">Zoom</Label>
          <Slider value={[zoom]} onValueChange={(v) => setZoom(v[0] ?? 1)} min={0.5} max={3} step={0.05} className="w-full" />
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cancel crop">
            <SquareX className="h-5 w-5" />
            <span className="sr-only">Cancel</span>
          </Button>
          <Button type="button" size="icon" onClick={handleConfirm} aria-label="Save crop">
            <Save className="h-5 w-5" />
            <span className="sr-only">Save</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ImageCropper };
