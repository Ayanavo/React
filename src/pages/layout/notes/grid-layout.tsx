import React from "react";
import { State } from "./state";

function gridlayout({ setIsOpen, isOpen }: { setIsOpen: (arg: State) => void; isOpen: State }) {
  function openNote(item: any): void {
    setIsOpen(item);
  }
  return <div className="m-3">grid-layout</div>;
}

export default gridlayout;
