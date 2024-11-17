import React from "react";

type Props = {};

function settings({}: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed flex-none p-3">
        <h1 className="text-3xl font-bold mb-6 text-start">Settings</h1>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-auto">
        <div></div>
      </main>
    </div>
  );
}

export default settings;
