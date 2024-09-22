import React from "react";
import FormBuilderComponent from "../form/form-builder";

function update() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed flex-none p-3">
        <h1 className="text-3xl font-bold mb-6 text-start">Create</h1>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-auto">
        <FormBuilderComponent />
      </main>
    </div>
  );
}

export default update;
