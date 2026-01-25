import { CVElement, fontWeight, useCV } from "@/lib/useCV";
import React, { CSSProperties } from "react";
import { Trash } from "lucide-react";
import moment from "moment";

const formatDate = (
    iso: string | undefined,
    dateFormat?: string,
    includeTime?: boolean,
    timeFormat?: "24" | "12-lower" | "12-upper"
) => {
    const m = moment(iso, moment.ISO_8601, true);
    const safe = m.isValid() ? m : moment();

    let base = "DD MM YYYY";

    switch (dateFormat) {
        case "DD_MMM_YYYY":
            base = "DD MMM YYYY";
            break;
        case "DD_MMMM_YYYY":
            base = "DD MMMM YYYY";
            break;
        case "MMM_YYYY":
            base = "MMM YYYY";
            break;
        case "MMMM_YYYY":
            base = "MMMM YYYY";
            break;
        case "YYYY":
            base = "YYYY";
            break;
        case "DD_MM_YYYY":
        default:
            base = "DD MM YYYY";
    }

    if (!includeTime) {
        return safe.format(base);
    }

    let time = "HH:mm";

    if (timeFormat === "12-lower") {
        time = "hh:mm a";
    } else if (timeFormat === "12-upper") {
        time = "hh:mm A";
    }

    return safe.format(`${base} ${time}`);
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

            <div className={`rounded-sm px-1 transition ${isSelected ? "ring-2 ring-primary bg-primary/5" : "ring-1 ring-transparent hover:ring-muted"}`} style={style}>   {formatDate(
                value,
                element.properties?.dateFormat,
                element.properties?.includeTime,
                element.properties?.timeFormat
            )}

            </div>
        </div>
    );
};

export default CvDateRenderer;
