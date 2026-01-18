import React from "react";
import Canvas from "../cv-builder/canvas";
import Pallet from "../cv-builder/pallet";
import { CVProvider } from "@/lib/useCV";

const CVBuilder = () => {
  return (
    <CVProvider>
      <div className="flex h-[90vh] overflow-hidden">
        <Pallet />
        <Canvas />
      </div>
    </CVProvider>
  );
};

export default CVBuilder;
