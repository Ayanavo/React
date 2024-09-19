import React from "react";
import { useParams } from "react-router-dom";
import FormBuilderComponent from "../form/form-builder";

function details() {
  const { id } = useParams();
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-none p-3">
        <h1 className="text-3xl font-bold mb-6 text-start">Details for {id}</h1>
      </div>
      <FormBuilderComponent />
    </div>
  );
}

export default details;
