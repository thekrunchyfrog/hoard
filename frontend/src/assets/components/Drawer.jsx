import React, { useEffect } from "react";
import { DrawerContent } from "./index";

export function Drawer({ isOpen, onClose }) {
  // Prevent body scrolling when the drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/80 transition-opacity duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => onClose()}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 z-50 rounded-l-3xl h-full w-[640px] max-w-full bg-slate-400 p-6 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none"
          aria-label="Close drawer"
        >
          ✕
        </button>

        {/* Drawer Content */}
        {<DrawerContent />}
      </div>
    </>
  );
}
