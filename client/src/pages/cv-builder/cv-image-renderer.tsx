import { ImageCropper } from "@/components/ui/image-cropper";
import { CVElement, useCV } from "@/lib/useCV";
import { Crop, ImagePlus, RefreshCw, Trash, Trash2 } from "lucide-react";
import React, { CSSProperties, useState } from "react";

const CvImageRenderer = ({
    element,
    readonly = false,
}: {
    element: CVElement;
    readonly?: boolean;
}) => {
    const { updateElement, selectedElementId, selectElement, removeElement } =
        useCV();
    const [cropOpen, setCropOpen] = useState(false);
    const [cropSrc, setCropSrc] = useState<string | null>(null);

    const isSelected = selectedElementId === element.id;

    /* ---------------- IMAGE CONFIG ---------------- */
    const imageStyle = element.properties?.imageStyle ?? {};
    const imageBorder = element.properties?.imageBorder ?? {};

    /* ---------------- BLOCK ALIGNMENT ---------------- */
    const wrapperStyle: CSSProperties =
        element.properties?.textAlign === "center"
            ? { justifyContent: "center" }
            : element.properties?.textAlign === "end"
                ? { justifyContent: "flex-end" }
                : { justifyContent: "flex-start" };

    /* ---------------- IMAGE BOX STYLE ---------------- */
    const scale = element.properties?.imageStyle?.imageScale ?? 1;
    const META = 120;
    const width = META? META * scale: 120;
    const height = META ? META * scale: 120;
    const imageBoxStyle: CSSProperties = {
        width,
        height,
        borderRadius: imageStyle.radius ?? 0,
        overflow: "hidden",
    };

    // PADDING LAYER (between border and image)
    const paddingStyle: CSSProperties = {
        padding: imageBorder.padding ?? 0,
        boxSizing: "content-box",
    };

    // BORDER LAYER (outermost)
    const borderStyle: CSSProperties = {
        border: imageBorder.enabled
            ? `${imageBorder.borderWidth ?? 1}px solid ${imageBorder.borderColor ?? "#000"}`
            : "none",
        borderRadius: imageStyle.radius ?? 0,
    };


    /* ---------------- IMAGE UPLOAD ---------------- */
    const handleUpload = (file: File) => {
        const reader = new FileReader();

        reader.onload = () => {
            const src = reader.result as string;

            const img = new Image();
            img.onload = () => {
                setCropSrc(src);
                setCropOpen(true);
                updateElement(element.id, {
                    properties: {
                        ...element.properties,
                        imageSrc: src,
                        imageStyle: {
                            ...element.properties?.imageStyle,
                            imageScale: 1,
                        },
                        imageMeta: {
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight,
                        },
                    },
                });
            };

            img.src = src;
        };

        reader.readAsDataURL(file);
    };



    return (
        <div
            className="relative"
            onClick={
                !readonly
                    ? (e) => {
                        e.stopPropagation();
                        selectElement(element.id);
                    }
                    : undefined
            }
        >
            {/* DELETE ELEMENT */}
            {!readonly && isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeElement(element.id);
                    }}
                    className="absolute top-2 right-2 bg-secondary text-secondary-foreground p-1 rounded shadow z-10"
                >
                    <Trash className="h-3 w-3" />
                </button>
            )}

            {/* BLOCK ALIGNMENT WRAPPER */}
            <div className="flex w-full" style={wrapperStyle}>
                {/* BORDER */}
                <div
                    style={borderStyle}
                    className={isSelected ? "ring-2" : ""}
                >
                    {/* PADDING */}
                    <div style={paddingStyle}>
                        {/* IMAGE BOX (FIXED SIZE) */}
                        <div
                            style={imageBoxStyle}
                            className="bg-muted flex items-center justify-center"
                        >
                            {element.properties?.imageSrc ? (
                                <img
                                    src={element.properties.imageSrc}
                                    className="w-full h-full object-cover select-none"
                                    draggable={false}
                                />
                            ) : (
                                !readonly && (
                                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1 text-muted-foreground text-xs w-full h-full">
                                        <ImagePlus className="h-5 w-5" />
                                        Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) =>
                                                e.target.files && handleUpload(e.target.files[0])
                                            }
                                        />
                                    </label>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {cropSrc && (
                <ImageCropper
                    open={cropOpen}
                    image={cropSrc}
                    aspect={1}
                    onClose={() => {
                        setCropOpen(false);
                        setCropSrc(null);
                    }}
                    onCropped={(dataUrl) => {
                        updateElement(element.id, {
                            properties: {
                                ...element.properties,
                                imageSrc: dataUrl,
                            },
                        });
                        setCropOpen(false);
                        setCropSrc(null);
                    }}
                />
            )}

        </div>
    );
};

export default CvImageRenderer;
