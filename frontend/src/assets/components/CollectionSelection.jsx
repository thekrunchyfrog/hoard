import { PixelSelect } from "@pxlkit/ui-kit";
import { useState, useEffect } from "react";
import { DyTable } from "./DyTable";

const API_BASE_URL = "http://localhost:5000/api";

export function CollectionSelection({ onCollectionSelect }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/collections`);
      const data = await response.json();
      setCollections(data);
      if (data.length > 0 && !selectedCollection) {
        setSelectedCollection(data[0].id);
      }
    } catch (err) {
      setError("Failed to fetch collections: " + err.message);
    }
  };

  const fetchItemsByCollection = async (collectionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/collections/${collectionId}/items`,
      );
      const data = await response.json();
      setItems(data);
      setHeaders(data.length > 0 ? Object.keys(data[0]) : []);
    } catch (err) {
      setError("Failed to fetch items: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionChange = (e) => {
    console.log("Selected collection:", e);
    const collectionId = e;
    setSelectedCollection(collectionId);
    if (collectionId && collectionId !== "") {
      fetchItemsByCollection(collectionId);
      if (onCollectionSelect) {
        onCollectionSelect(collectionId);
      }
    }
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-20 py-20">
          <div>
            <PixelSelect
              tone="purple"
              label="Select a Collection"
              value={selectedCollection || ""}
              onChange={(e) => handleCollectionChange(e)}
              options={[
                { label: "-- Select a Collection --", value: "" },
                ...collections.map((collection) => ({
                  label: collection.collection_name,
                  value: collection.collection_table,
                })),
              ]}
            />
          </div>

          {error && (
            <div
              className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6"
              role="alert"
            >
              {error}
            </div>
          )}

          {selectedCollection && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-4">
                Items in Collection:{" "}
                {
                  collections.find(
                    (c) => c.collection_table === selectedCollection,
                  )?.collection_name
                }
              </h3>
              {loading ? (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg mb-6">
                  Loading items...
                </div>
              ) : items.length > 0 ? (
                <DyTable
                  selectedCollection={selectedCollection}
                  items={items}
                />
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg mb-6">
                  No items found in this collection.
                </div>
              )}
            </div>
          )}

          {collections.length === 0 && !error && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg">
              Loading collections...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
