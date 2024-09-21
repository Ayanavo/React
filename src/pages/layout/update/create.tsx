import React from "react";
import FormBuilderComponent from "../form/form-builder";

function update() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-none p-3">
        <h1 className="text-3xl font-bold mb-6 text-start">Create</h1>
      </div>
      <FormBuilderComponent />
    </div>
  );
}

export default update;
