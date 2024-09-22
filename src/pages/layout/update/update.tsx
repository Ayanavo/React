import React from "react";
import { useParams } from "react-router-dom";
import FormBuilderComponent from "../form/form-builder";

function update() {
  const { id } = useParams();
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed flex-none p-3">
        <h1 className="text-3xl font-bold mb-6 text-start">Update {id}</h1>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-auto">
        <FormBuilderComponent />
      </main>
    </div>
  );
}

export default update;
