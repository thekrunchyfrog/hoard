import React from "react";
import { PixelGrid } from "@pxlkit/ui-kit";

function Cell({ children }) {
  return (
    <div className="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">
      {children}
    </div>
  );
}

export function DrawerContent() {
  return (
    <div className="p-4">
      <img
        className="max-w-[350px] rounded-3xl border-4 border-red-500"
        src="src/assets/images/pac/front_pac.jpeg"
        alt="Test"
      />
    </div>
  );
}
