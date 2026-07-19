import React from "react";
import logo from "./assets/images/dragonLogo.webp";
import { HoardHeader, CollectionSelection } from "./assets/components";

function App() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <HoardHeader />
        <CollectionSelection />
      </div>
    </div>
  );
}

export default App;
