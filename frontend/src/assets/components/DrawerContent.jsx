import React from "react";
import { PxlKitIcon } from "@pxlkit/core";
import {
  PixelCard,
  PixelButton,
  PixelProgress,
  PixelGrid,
  PixelBentoCell,
} from "@pxlkit/ui-kit";
import { Trophy } from "@pxlkit/gamification";
import { InfoCircle } from "@pxlkit/feedback";
import { ImageSpinner } from "./ImageSpinner";

function Cell({ children }) {
  return (
    <div className="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">
      {children}
    </div>
  );
}

export function DrawerContent({ item }) {
  return (
    <div>
      <center>
        <ImageSpinner picFolder="pac" />
      </center>
      <div>
        <PixelCard
          tone="red"
          title="Lunchbox Details"
          icon={<PxlKitIcon icon={InfoCircle} size={32} />}
        >
          <PixelGrid cols={1} gap={1}>
            <Cell>{item.lunchbox_name}</Cell>
            <Cell>
              <PixelProgress
                label="Lunchbox Condition"
                value={item.lunchbox_condition * 10}
              />
            </Cell>
            <Cell>Three</Cell>
            <Cell>Four</Cell>
            <Cell>Five</Cell>
            <Cell>Six</Cell>
          </PixelGrid>
        </PixelCard>
      </div>
    </div>
  );
}
