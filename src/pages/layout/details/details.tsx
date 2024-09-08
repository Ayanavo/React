import React from "react";
import { useParams } from "react-router-dom";
import FormBuilderComponent from "../form/form-builder";

function details() {
  const { id } = useParams();
  return (
    <>
      <h1>Details for {id}</h1>
      <FormBuilderComponent />
    </>
  );
}

export default details;
