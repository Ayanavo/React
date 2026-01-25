import { CVElement, fontWeight, useCV } from "@/lib/useCV";
import React, { CSSProperties } from "react";
import { Trash } from "lucide-react";
import moment from "moment";

const formatDate = (iso: string | undefined, format?: string) => {
    const m = moment(iso, moment.ISO_8601, true);

    const safe = m.isValid() ? m : moment();

    switch (format) {
        case "DD":
            return safe.format("DD");
        case "MM":
            return safe.format("MM");
        case "YYYY":
            return safe.format("YYYY");
        case "MM_YYYY":
            return safe.format("MM YYYY");
        case "MM_YYYY_TIME":
            return safe.format("MM YYYY HH:mm");
        case "DD_MM_YYYY":
            return safe.format("DD MM YYYY");
        case "DD_MM_YYYY_TIME":
        default:
            return safe.format("DD MM YYYY HH:mm");
    }
};

const CvDateRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean; }) => {
    const { updateElement, selectedElementId, selectElement, removeElement } = useCV();
    const isSelected = selectedElementId === element.id;
    const fontWeightMap: Record<fontWeight, number> = {
        light: 300,
        normal: 400,
        medium: 500,
        "semi-bold": 600,
        bold: 700,
    };

    const style: CSSProperties = {
        fontSize: element.properties?.fontSize
            ? `${element.properties.fontSize}px`
            : undefined,
        fontWeight: element.properties?.fontWeight
            ? fontWeightMap[element.properties.fontWeight]
            : undefined,
        fontStyle: element.properties?.fontStyle?.italic ? "italic" : "normal",
        textDecoration: [
            element.properties?.fontStyle?.underline && "underline",
            element.properties?.fontStyle?.strikethrough && "line-through",
        ]
            .filter(Boolean)
            .join(" "),
        textAlign: element.properties?.textAlign,
        color: element.properties?.color,
    };

    const value =
        typeof element.content === "string"
            ? element.content
            : moment().toISOString();

    return (
        <div className="relative" onClick={
            !readonly
                ? (e) => {
                    e.stopPropagation();
                    selectElement(element.id);
                }
                : undefined
        }
        >
            {!readonly && isSelected && (
                <button onClick={(e) => {
                    e.stopPropagation();
                    removeElement(element.id);
                }}
                    className="absolute top-2 right-2 bg-secondary text-secondary-foreground p-1 rounded shadow">
                    <Trash className="h-3 w-3" />
                </button>
            )}

            {!readonly && (
                <input
                    type="datetime-local"
                    className="sr-only"
                    onChange={(e) =>
                        updateElement(element.id, {
                            content: moment(e.target.value).toISOString(),
                        })
                    }

                />
            )}

            <div className={`rounded-sm px-1 transition ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}`} style={style}>    {formatDate(value, element.properties?.dateFormat)}</div>
        </div>
    );
};

export default CvDateRenderer;
