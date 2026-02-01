import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useCV } from "@/lib/useCV";
import { X } from "lucide-react";
import CVElementRenderer from "./cv-element-renderer";

export interface CVPreviewRef {
    openPreview: () => void;
}

const CVPreview = forwardRef<CVPreviewRef>((_, ref) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);
    const { A4_HEIGHT, A4_WIDTH, elements } = useCV();

    const zoomIn = () => setPreviewScale((s) => Math.min(s + 0.1, 2.5));
    const zoomOut = () => setPreviewScale((s) => Math.max(s - 0.1, 0.4));
    const resetZoom = () => setPreviewScale(getScaleToFit());

    const openPreview = () => {
        setPreviewScale(getScaleToFit());
        setIsPreviewOpen(true);
    };

    useImperativeHandle(ref, () => ({
        openPreview,
    }));

    const getScaleToFit = () => {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;

        const scaleX = maxWidth / A4_WIDTH;
        const scaleY = maxHeight / A4_HEIGHT;

        return Math.min(scaleX, scaleY);
    };

    if (!isPreviewOpen) {
        return null;
    }
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        {/* zoom options */}
        <div className="absolute top-2 right-2 z-30 flex gap-2 bg-black/70 rounded px-2 py-1">
            <button onClick={zoomOut} className="text-white px-2">
                -
            </button>
            <span className="text-white text-sm">{Math.round(previewScale * 100)}%</span>
            <button onClick={zoomIn} className="text-white px-2">
                +
            </button>
            <button onClick={resetZoom} className="text-white text-xs px-2">
                Fit
            </button>
        </div>

        <div className="relative flex items-center justify-center">
            <button className="absolute top-2 right-2 z-30 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition" onClick={() => setIsPreviewOpen(false)}>
                <X className="h-4 w-4" />
            </button>

            <div
                style={{
                    width: A4_WIDTH * previewScale,
                    height: A4_HEIGHT * previewScale,
                }}
                className="relative">
                <div
                    className="bg-white shadow-2xl"
                    style={{
                        width: A4_WIDTH,
                        height: A4_HEIGHT,
                        transform: `scale(${previewScale})`,
                        transformOrigin: "top left",
                    }}>
                    <div className="flex flex-col w-full h-full pointer-events-none">
                        {elements.map((page) => (
                            <div key={page.id} className="flex w-full" style={{ height: `${100 / elements.length}%` }}>
                                {page.children?.map((section) => (
                                    <div key={section.id} className="flex-1">
                                        <CVElementRenderer element={section} readonly />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
});

export default CVPreview;