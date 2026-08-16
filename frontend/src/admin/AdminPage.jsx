import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchCollections,
  fetchItems,
  createItem,
  updateItem,
  getAdminToken,
  setAdminToken,
} from "./adminApi";
import { collectionMappings, getIdField, getNameField } from "./adminConfig";
import { AdminForm } from "./AdminForm";

export function AdminPage() {
  const [token, setToken] = useState(getAdminToken());
  const [tokenInput, setTokenInput] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // null = not editing, {} = adding new
  const [showForm, setShowForm] = useState(false);
  const [sortDir, setSortDir] = useState(null); // null | "asc" | "desc"

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch((err) => setError("Failed to load collections: " + err.message));
  }, []);

  useEffect(() => {
    if (!selectedCollection) return;
    setLoading(true);
    setError(null);
    setSortDir(null);
    fetchItems(selectedCollection)
      .then(setItems)
      .catch((err) => setError("Failed to load items: " + err.message))
      .finally(() => setLoading(false));
  }, [selectedCollection]);

  const handleSaveToken = (e) => {
    e.preventDefault();
    setAdminToken(tokenInput.trim());
    setToken(tokenInput.trim());
  };

  const handleClearToken = () => {
    setAdminToken("");
    setToken("");
    setTokenInput("");
  };

  const mappings = selectedCollection ? collectionMappings[selectedCollection] : null;
  const idField = mappings ? getIdField(mappings) : null;
  const nameField = mappings ? getNameField(mappings) : null;

  const handleSortByName = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const displayedItems = (() => {
    if (!sortDir || !nameField) return items;
    const field = nameField.field_name;
    const sorted = [...items].sort((a, b) => {
      const av = String(a[field] ?? "").toLowerCase();
      const bv = String(b[field] ?? "").toLowerCase();
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    if (sortDir === "desc") sorted.reverse();
    return sorted;
  })();

  const reloadItems = () => {
    if (!selectedCollection) return;
    fetchItems(selectedCollection).then(setItems).catch(() => {});
  };

  const handleAddNew = () => {
    setEditingItem({});
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = async (payload) => {
    if (editingItem && idField && editingItem[idField.field_name] != null) {
      await updateItem(selectedCollection, editingItem[idField.field_name], payload);
    } else {
      await createItem(selectedCollection, payload);
    }
    setShowForm(false);
    setEditingItem(null);
    reloadItems();
  };

  if (!token) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Enter the admin token (set as <code>ADMIN_TOKEN</code> on the
          backend) to manage collection data.
        </p>
        <form onSubmit={handleSaveToken} className="flex gap-2">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Admin token"
            className="border rounded px-2 py-1 flex-1"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Admin</h2>
        <button
          onClick={handleClearToken}
          className="text-sm text-gray-500 hover:text-gray-800 underline"
        >
          Log out
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="text-sm font-semibold mr-2">Collection:</label>
        <select
          value={selectedCollection || ""}
          onChange={(e) => {
            setSelectedCollection(e.target.value || null);
            setShowForm(false);
            setEditingItem(null);
          }}
          className="border rounded px-2 py-1"
        >
          <option value="">-- Select a Collection --</option>
          {collections.map((c) => (
            <option key={c.collection_table} value={c.collection_table}>
              {c.collection_name}
            </option>
          ))}
        </select>
      </div>

      {selectedCollection && !collectionMappings[selectedCollection] && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg mb-4">
          No field mapping config found for "{selectedCollection}". Add one
          under <code>frontend/src/assets/config/</code> and register it in{" "}
          <code>frontend/src/admin/adminConfig.js</code> to enable admin
          add/edit for this collection.
        </div>
      )}

      {selectedCollection && mappings && (
        <>
          <div className="mb-4">
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              + Add New Item
            </button>
          </div>

          {showForm && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">
                {editingItem && idField && editingItem[idField.field_name] != null
                  ? "Edit Item"
                  : "Add New Item"}
              </h3>
              <AdminForm
                mappings={mappings}
                item={editingItem}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                submitLabel={
                  editingItem && idField && editingItem[idField.field_name] != null
                    ? "Save Changes"
                    : "Create Item"
                }
              />
            </div>
          )}

          {loading ? (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg">
              Loading items...
            </div>
          ) : items.length === 0 ? (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg">
              No items in this collection yet.
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b">
                  {mappings
                    .filter((m) => !m.hidden)
                    .map((m) =>
                      nameField && m.field_name === nameField.field_name ? (
                        <th key={m.field_name} className="p-2">
                          <button
                            type="button"
                            onClick={handleSortByName}
                            className="flex items-center gap-1 font-semibold hover:underline"
                            title="Sort by name"
                          >
                            {m.header_name}
                            <span className="text-xs">
                              {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "⇕"}
                            </span>
                          </button>
                        </th>
                      ) : (
                        <th key={m.field_name} className="p-2">
                          {m.header_name}
                        </th>
                      )
                    )}
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item, idx) => (
                  <tr
                    key={idField ? item[idField.field_name] : idx}
                    className="border-b hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {mappings
                      .filter((m) => !m.hidden)
                      .map((m) => (
                        <td key={m.field_name} className="p-2">
                          {String(item[m.field_name] ?? "-")}
                        </td>
                      ))}
                    <td className="p-2 space-x-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {idField && item[idField.field_name] != null && (
                        <Link
                          to={`/admin/${selectedCollection}/${item[idField.field_name]}/images`}
                          state={{
                            itemName: nameField ? item[nameField.field_name] : null,
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Images
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
