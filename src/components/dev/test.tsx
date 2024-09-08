import React from "react";
import PropComponent from "./prop";
// import { useState } from "react";

function Test() {
  // const [counter, setCounter] = useState("");

  const name: string = "Ayanavo";
  return (
    <>
      <div>Hello {name}!</div>
      <div className="w-full h-screen">
        <div className="p-4 grid grid-flow-row auto-rows-max">
          {[]
            .constructor(6)
            .fill(0)
            .map((_: 0, i: number) => {
              let content;

              if (i % 2 === 0) {
                content = (
                  <a className=" no-underline hover:underline" href={"./" + i}>
                    I am an anchor tag {i + 1}
                  </a>
                );
              } else {
                let index: number = i;
                content = <PropComponent index={index} />;
              }
              return <div key={i}>{content}</div>;
            })}
        </div>
      </div>
    </>
  );
}

export default Test;
