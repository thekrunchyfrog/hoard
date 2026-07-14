import React, { useState, useEffect } from "react";
import logo from "./assets/images/dragonLogo.webp";
import DyTable from "./assets/components/DyTable";

const API_BASE_URL = "http://localhost:5000/api";

function App() {
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
    const collectionId = e.target.value;
    setSelectedCollection(collectionId);
    fetchItemsByCollection(collectionId);
  };

  return (
    <div className="container mt-5">
      <div>
        <img src={logo} alt="Dragon Logo" height="100" width="100" />
      </div>
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h1 className="mb-0">Toy Collection App</h1>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <label htmlFor="collectionSelect" className="form-label">
              Select a Collection
            </label>
            <select
              id="collectionSelect"
              className="form-select"
              value={selectedCollection || ""}
              onChange={handleCollectionChange}
            >
              <option key="placeholder" value="">
                -- Select a Collection --
              </option>
              {collections.map((collection) => (
                <option
                  key={collection.collection_name}
                  value={collection.collection_table}
                >
                  {collection.collection_name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {selectedCollection && (
            <div>
              <h3 className="mt-4">
                Items in Collection:{" "}
                {
                  collections.find(
                    (c) => c.collection_table === selectedCollection,
                  )?.collection_name
                }
              </h3>
              {loading ? (
                <div className="alert alert-info">Loading items...</div>
              ) : items.length > 0 ? (
                <DyTable
                  selectedCollection={selectedCollection}
                  items={items}
                />
              ) : (
                <div className="alert alert-info">
                  No items found in this collection.
                </div>
              )}
            </div>
          )}

          {collections.length === 0 && !error && (
            <div className="alert alert-info">Loading collections...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
