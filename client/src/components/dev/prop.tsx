import React from "react";
import { Button } from "../ui/button";

function prop({ index = 0 }: { index: number }) {
  return <Button>I'm a button {index + 1}</Button>;
}

export default prop;
