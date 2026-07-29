import { useState } from "react";
import { PixelDrawer } from "@pxlkit/ui-kit";

export function PxDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open drawer
      </button>
      <PixelDrawer open={open} onOpenChange={setOpen} title="Settings">
        <PixelDrawer.Header>
          <span>Settings</span>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </PixelDrawer.Header>
        <PixelDrawer.Body>
          <p>Drawer content goes here.</p>
        </PixelDrawer.Body>
        <PixelDrawer.Footer>
          <button type="button" onClick={() => setOpen(false)}>
            Done
          </button>
        </PixelDrawer.Footer>
      </PixelDrawer>
    </>
  );
}
