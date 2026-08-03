import { PixelTable, PixelBadge, PixelProgress } from "@pxlkit/ui-kit";
import { useState } from "react";
import { Drawer } from "./Drawer";
import skipper_fashion_mappings from "../config/skipper_fashion.json";
import lunchbox_mappings from "../config/lunchbox.json";

const configMap = {
  lunchbox: lunchbox_mappings,
  skipper_fashion: skipper_fashion_mappings,
};

export function DyTable({ items, selectedCollection }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const mappings = configMap[selectedCollection] || [];

  // Default sort by first column (ascending)
  const firstColumnKey = mappings[0]?.field_name;
  const defaultSortState = firstColumnKey
    ? { sortKey: firstColumnKey, direction: "asc" }
    : null;

  const [sortState, setSortState] = useState(defaultSortState);

  if (!configMap[selectedCollection]) {
    return (
      <div className="overflow-x-auto">
        <div className="p-4 text-center">
          <p className="text-red-500">
            Invalid collection: "{selectedCollection}"
          </p>
          <p className="text-gray-500 text-sm">
            Available collections: {Object.keys(configMap).join(", ")}
          </p>
        </div>
      </div>
    );
  }

  // Add sortable property to column definitions that have sortable data
  // Filter out hidden columns
  const columns = mappings
    .filter((mapping) => !mapping.hidden)
    .map((mapping) => ({
      header: mapping.header_name,
      key: mapping.field_name,
      sortable: true,
    }));

  const handleSortChange = (next) => {
    setSortState(next);
  };

  // Sort the data based on current sort state
  const sortedData = [...items]
    .map((item) => {
      const row = {};
      mappings.forEach((mapping) => {
        let value = item[mapping.field_name];
        // Only convert to checkmark if field_name starts with "is_" or "has_"
        if (
          (mapping.field_name.startsWith("is_") ||
            mapping.field_name.startsWith("has_")) &&
          value === 1
        ) {
          value = <PixelBadge tone="green">yes</PixelBadge>;
        } else if (
          (mapping.field_name.startsWith("is_") ||
            mapping.field_name.startsWith("has_")) &&
          value === 0
        ) {
          value = <PixelBadge tone="red">no</PixelBadge>;
        }
        if (
          mapping.field_name.includes("condition") &&
          !mapping.field_name.includes("_notes") &&
          value !== null
        ) {
          value = <PixelProgress showValue={false} value={value * 10} />;
        }
        row[mapping.field_name] = value == null || value === "" ? "-" : value;
      });
      return row;
    })
    .sort((a, b) => {
      if (!sortState) return 0;
      const { sortKey, direction } = sortState;
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (direction === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return bVal > aVal ? 1 : -1;
      }
    });

  const handleRowClick = (row, rowIndex) => {
    setIsDrawerOpen(true);
    setSelectedItemId(row.lunchbox_id || row.skipper_fashion_id);
  };

  return (
    <div className="overflow-x-auto">
      <PixelTable
        columns={columns}
        data={sortedData}
        sort={sortState}
        onSortChange={handleSortChange}
        bordered={true}
        surface="pixel"
        tone="retro-green"
        onRowClick={handleRowClick}
      />
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={
          items.find((u) => u.lunchbox_id === selectedItemId) ||
          items.find((u) => u.skipper_fashion_id === selectedItemId)
        }
      />
    </div>
  );
}
