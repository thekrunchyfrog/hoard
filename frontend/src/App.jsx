import React from "react";
import { useState } from "react";
import logo from "./assets/images/dragonLogo.webp";
import {
  HoardHeader,
  CollectionSelection,
  PxDrawer,
  Drawer2 as Drawer,
} from "./assets/components";

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-xl shadow-lg">
        <HoardHeader />
        <CollectionSelection />

        <div className="p-8 font-sans">
          <h1 className="text-2xl font-bold mb-4">React Drawer Demo</h1>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Open Drawer
          </button>

          <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <h2 className="text-xl font-semibold mb-4">Drawer Title</h2>
            <p className="text-gray-600 mb-2">
              This is the interior content of your animated drawer component.
            </p>
            <p className="text-gray-600">
              You can put links, forms, or navigation menus here.
            </p>
          </Drawer>
        </div>
      </div>
    </div>
  );
}

export default App;
