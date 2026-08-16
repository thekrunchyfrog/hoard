import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { uploadItemImages } from "./adminApi";

const ACCEPTED_TYPES = ["image/jpeg", "image/webp"];

function isAcceptedFile(file) {
  return ACCEPTED_TYPES.includes(file.type);
}

// Image upload page for a single item. Reached from a link on the admin
// table row. Supports picking files via the OS file dialog or dragging
// them onto the drop zone; no count or size limit (first pass).
export function ImageUploader() {
  const { collection, itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const itemName = location.state?.itemName;
  const fileInputRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList);
    const accepted = incoming.filter(isAcceptedFile);
    const rejected = incoming.filter((f) => !isAcceptedFile(f));
    if (rejected.length > 0) {
      setError(
        `Skipped ${rejected.length} file(s) that weren't JPG or WEBP: ${rejected
          .map((f) => f.name)
          .join(", ")}`
      );
    } else {
      setError(null);
    }
    if (accepted.length > 0) {
      setSelectedFiles((prev) => [...prev, ...accepted]);
    }
  }, []);

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset so selecting the same file again still fires onChange.
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeSelected = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadItemImages(collection, itemId, selectedFiles);
      setResult(res);
      setSelectedFiles([]);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upload Images</h2>
        <button
          onClick={() => navigate("/admin")}
          className="text-sm text-gray-500 hover:text-gray-800 underline"
        >
          Back to admin
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Collection: <code>{collection}</code> &middot; Item:{" "}
        <code>{itemName || `#${itemId}`}</code>
      </p>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg mb-4">
          Uploaded {result.uploaded?.length ?? 0} image(s) to{" "}
          <code>{result.photo_location}</code>.
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <p className="text-gray-600 dark:text-gray-300">
          Drag and drop JPG or WEBP images here, or click to choose files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">
            Selected files ({selectedFiles.length})
          </h3>
          <ul className="space-y-1">
            {selectedFiles.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                className="flex justify-between items-center text-sm bg-slate-100 dark:bg-slate-800 rounded px-3 py-2"
              >
                <span>
                  {file.name}{" "}
                  <span className="text-gray-500">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                </span>
                <button
                  onClick={() => removeSelected(idx)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            {uploading ? "Uploading..." : `Upload ${selectedFiles.length} image(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
