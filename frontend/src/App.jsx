import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HoardHeader, CollectionSelection, Drawer } from "./assets/components";
import { AdminPage } from "./admin/AdminPage";

function HomePage() {
  return (
    <>
      <CollectionSelection />
      <Drawer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl shadow-lg">
          <HoardHeader />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;
