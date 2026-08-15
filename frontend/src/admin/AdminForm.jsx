import { useState, useEffect } from "react";
import { inferFieldType } from "./adminConfig";

// Renders a form generated from a collection's field-mapping config.
// Used for both "add new item" (item=null) and "edit item" (item set).
export function AdminForm({ mappings, item, onSubmit, onCancel, submitLabel }) {
  const editableMappings = mappings.filter((m) => !m.hidden);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initial = {};
    editableMappings.forEach((m) => {
      const raw = item ? item[m.field_name] : "";
      initial[m.field_name] = raw == null ? "" : raw;
    });
    setValues(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const handleChange = (fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Coerce booleans/numbers back before sending.
      const payload = {};
      editableMappings.forEach((m) => {
        const type = inferFieldType(m);
        const raw = values[m.field_name];
        if (type === "boolean") {
          payload[m.field_name] = raw ? 1 : 0;
        } else if (type === "number") {
          payload[m.field_name] = raw === "" ? null : Number(raw);
        } else {
          payload[m.field_name] = raw === "" ? null : raw;
        }
      });
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-3"
    >
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      {editableMappings.map((m) => {
        const type = inferFieldType(m);
        const value = values[m.field_name] ?? "";
        return (
          <div key={m.field_name} className="flex flex-col">
            <label className="text-sm font-semibold mb-1" htmlFor={m.field_name}>
              {m.header_name}
            </label>
            {type === "boolean" ? (
              <input
                id={m.field_name}
                type="checkbox"
                checked={!!value && value !== "0"}
                onChange={(e) => handleChange(m.field_name, e.target.checked)}
                className="w-5 h-5"
              />
            ) : type === "textarea" ? (
              <textarea
                id={m.field_name}
                value={value}
                onChange={(e) => handleChange(m.field_name, e.target.value)}
                className="border rounded px-2 py-1"
                rows={3}
              />
            ) : type === "number" ? (
              <input
                id={m.field_name}
                type="number"
                value={value}
                onChange={(e) => handleChange(m.field_name, e.target.value)}
                className="border rounded px-2 py-1"
              />
            ) : type === "date" ? (
              <input
                id={m.field_name}
                type="date"
                value={value ? String(value).slice(0, 10) : ""}
                onChange={(e) => handleChange(m.field_name, e.target.value)}
                className="border rounded px-2 py-1"
              />
            ) : (
              <input
                id={m.field_name}
                type="text"
                value={value}
                onChange={(e) => handleChange(m.field_name, e.target.value)}
                className="border rounded px-2 py-1"
              />
            )}
          </div>
        );
      })}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
