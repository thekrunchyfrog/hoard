import { PixelCarousel } from "@pxlkit/ui-kit";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000";

export function ImageSpinner({ picFolder }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchImageInfo(picFolder) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/photos/${picFolder}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.log("Failed to fetch collections: " + err.message);
      return [];
    }
  }

  useEffect(() => {
    async function loadImages() {
      const data = await fetchImageInfo(picFolder);
      setImages(data);
      setLoading(false);
    }
    loadImages();
  }, [picFolder]);

  function Slide({ image, label }) {
    return (
      <div>
        <a href={image + ".jpeg"} target="_blank" rel="noopener noreferrer">
          <img
            className="max-w-[350px] rounded-3xl border-4 border-red-500"
            src={image + ".webp"}
            alt={label}
          />
        </a>
        <span className="text-xs">{label}</span>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 ">
      <center>
        <PixelCarousel
          aria-label="Item Photos"
          opts={{ loop: true }}
          showArrows={false}
          showDots
        >
          {images.map((img) => (
            <PixelCarousel.Item key={img.label}>
              <Slide image={img.url} label={img.label} />
            </PixelCarousel.Item>
          ))}
        </PixelCarousel>
      </center>
    </div>
  );
}
