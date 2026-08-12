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
    ? { key: firstColumnKey, dir: "asc" }
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

  // Helper to render cell values (handles special column types)
  const renderValue = (mapping, value) => {
    if (value == null || value === "") return "-";
    // Only convert to badge if field_name starts with "is_" or "has_"
    if (
      (mapping.field_name.startsWith("is_") ||
        mapping.field_name.startsWith("has_")) &&
      (value === 1 || value === 0)
    ) {
      return value === 1
        ? <PixelBadge tone="green">yes</PixelBadge>
        : <PixelBadge tone="red">no</PixelBadge>;
    }
    if (
      mapping.field_name.includes("condition") &&
      !mapping.field_name.includes("_notes") &&
      typeof value === "number"
    ) {
      return <PixelProgress showValue={false} value={value * 10} />;
    }
    return value;
  };

  // Sort the items first using raw values, then map to rendered rows
  const sortedItems = [...items].sort((a, b) => {
    if (!sortState) return 0;
    const { key: sortKey, dir: direction } = sortState;
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    // Handle null/undefined values consistently
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === "asc" ? -1 : 1;
    if (bVal == null) return direction === "asc" ? 1 : -1;

    // Use appropriate comparison based on value type
    const isString = typeof aVal === "string" || typeof bVal === "string";
    if (isString) {
      const aStr = String(aVal).toLocaleLowerCase();
      const bStr = String(bVal).toLocaleLowerCase();
      if (aStr === bStr) return 0;
      return direction === "asc"
        ? (aStr > bStr ? 1 : -1)
        : (bStr > aStr ? 1 : -1);
    }

    if (aVal === bVal) return 0;
    return direction === "asc" ? aVal - bVal : bVal - aVal;
  });

  // Map sorted items to display rows with rendered components
  const sortedData = sortedItems.map((item) => {
    const row = {};
    mappings.forEach((mapping) => {
      row[mapping.field_name] = renderValue(mapping, item[mapping.field_name]);
    });
    return row;
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
        item={
          items.find((u) => u.lunchbox_id === selectedItemId) ||
          items.find((u) => u.skipper_fashion_id === selectedItemId)
        }
      />
    </div>
  );
}
