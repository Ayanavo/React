import React, { useEffect } from "react";
import { State } from "./state";
function gridlayout({ setIsOpen, isOpen, noteListing, onSelect }: { setIsOpen: (arg: boolean) => void; isOpen: boolean; noteListing: State[]; onSelect: (note: State) => void }) {
  useEffect(() => {
    return () => {
      isOpen && setIsOpen(false);
    };
  }, [isOpen, setIsOpen]);
  return (
    <div className="m-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
      {noteListing.map((item: State, index: number) => (
        <div key={index} className="rounded-lg border p-4 cursor-pointer hover:shadow" onClick={() => onSelect(item)}>
          <h3 className="font-bold text-lg">{item?.title}</h3>
          <p className="text-gray-600">{item?.description}</p>
        </div>
      ))}
    </div>
  );
}

export default gridlayout;
