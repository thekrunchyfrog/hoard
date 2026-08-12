// Reuse the same per-collection field mappings that drive the read-only
// table (DyTable) so admin forms stay in sync with what's already defined
// for display, instead of maintaining a second schema.
import lunchbox_mappings from "../assets/config/lunchbox.json";
import skipper_fashion_mappings from "../assets/config/skipper_fashion.json";

export const collectionMappings = {
  lunchbox: lunchbox_mappings,
  skipper_fashion: skipper_fashion_mappings,
};

// Infer a basic input type for a field, following the same conventions
// DyTable.jsx uses for rendering (is_/has_ prefixes -> boolean flags,
// "condition" -> numeric 0-10 scale). Falls back to text.
export function inferFieldType(mapping) {
  const name = mapping.field_name;
  if (name.startsWith("is_") || name.startsWith("has_")) {
    return "boolean";
  }
  if (name.includes("condition") && !name.includes("_notes")) {
    return "number";
  }
  if (name.endsWith("_notes") || name === "notes") {
    return "textarea";
  }
  if (name.includes("price")) {
    return "number";
  }
  if (name === "created_at") {
    return "date";
  }
  if (name.includes("year")) {
    return "number";
  }
  return "text";
}

export function getIdField(mappings) {
  return mappings.find((m) => m.hidden && m.field_name.endsWith("_id"));
}
