import { CVElement, useCV } from "@/lib/useCV";
import React, { useRef } from 'react';

const CvLocationRenderer = ({ element, readonly = false }: { element: CVElement; readonly?: boolean; }) => {
    const { updateElement, selectedElementId, removeElement, selectElement } = useCV();
    const ref = useRef<HTMLDivElement>(null);
    const isSelected = selectedElementId === element.id;
    
    return <div>Kolkata, 700042, India</div>
}
export default CvLocationRenderer;