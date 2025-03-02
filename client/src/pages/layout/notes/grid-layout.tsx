import React, { useEffect } from "react";
import { State } from "./state";
let noteListing: Array<State> = [];
function gridlayout({ setIsOpen, isOpen }: { setIsOpen: (arg: boolean) => void; isOpen: boolean }) {
  useEffect(() => {
    // (isOpen?.description || isOpen?.title) && noteListing.push(isOpen);
    return () => {
      isOpen && setIsOpen(false);
    };
  }, [isOpen]);
  // function openNote(item: any): void {
  //   setIsOpen(item);
  // }
  return <div className="m-3">grid-layout</div>;
}

export default gridlayout;
