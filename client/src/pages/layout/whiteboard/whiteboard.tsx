import React from "react";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [{ id: "1", position: { x: 0, y: 0 }, data: { label: "1" } }];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];
const proOptions = { hideAttribution: true };
function whiteboard() {
  return (
    <div className="flex flex-col">
      <div className="flex overflow-hidden h-[90vh]">
        <ReactFlow nodes={initialNodes} edges={initialEdges} fitView proOptions={proOptions}>
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default whiteboard;
