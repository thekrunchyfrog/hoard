import React from "react";
import { PxlKitIcon } from "@pxlkit/core";
import {
  PixelCard,
  PixelButton,
  PixelProgress,
  PixelDivider,
  PixelGrid,
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
        <PixelDivider label="photos" tone="neutral" spacing="lg" />
        <ImageSpinner picFolder={item.photo_location} />
      </center>
      <PixelDivider label="information" tone="neutral" spacing="lg" />
      <div>
        <PixelCard
          tone="red"
          title="Lunchbox Details"
          icon={<PxlKitIcon icon={InfoCircle} size={32} />}
        >
          <PixelGrid cols={2} gap={1}>
            <div style={{ gridColumn: "span 2" }}>
              <Cell>
                <span>{item.lunchbox_name}</span>
                <span class="float-right">
                  {item.lunchbox_maker || "unknown maker"} (
                  {item.lunchbox_year || "unknown year"})
                </span>
              </Cell>
            </div>
            <Cell>
              <PixelProgress
                label="Lunchbox Condition"
                value={item.lunchbox_condition * 10}
              />
            </Cell>
            <Cell>
              <PixelProgress
                label="Thermos Condition"
                value={item.thermos_condition * 10}
              />
            </Cell>
            <Cell>
              <p>Lunchbox Condition Notes:</p>
              <p class="indent-4">{item.lunchbox_condition_notes || "N/A"}</p>
            </Cell>
            <Cell>
              <p>Thermos Condition Notes:</p>
              <p class="indent-4">{item.thermos_condition_notes || "N/A"}</p>
            </Cell>
            <Cell>
              <p>Date added to collection:</p>
              <p class="indent-4">
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-US")
                  : "N/A"}
              </p>
            </Cell>
            <Cell>
              <p>Price Paid:</p>
              <p class="indent-4">
                {item.price_paid ? `$${item.price_paid}` : "N/A"}
              </p>
            </Cell>
          </PixelGrid>
        </PixelCard>
      </div>
    </div>
  );
}
