import { PixelCarousel } from "@pxlkit/ui-kit";

function Slide({ image, label }) {
  return (
    <div>
      <img
        className="max-w-[350px] rounded-3xl border-4 border-red-500"
        src={image}
        alt={label}
      />
      <span className="text-xs">{label}</span>
    </div>
  );
}

export function ImageSpinner(picFolder) {
  return (
    <div>
      <center>
        <PixelCarousel
          aria-label="Item Photos"
          opts={{ loop: true }}
          showArrows
          showDots
        >
          <PixelCarousel.Item>
            <Slide image="src/assets/images/pac/front_pac.jpeg" label="front" />
          </PixelCarousel.Item>
          <PixelCarousel.Item>
            <img
              className="max-w-[350px] rounded-3xl border-4 border-red-500"
              src="src/assets/images/pac/back_pac.jpeg"
              alt="Test"
            />
            <span className="text-xs">back</span>
          </PixelCarousel.Item>
          <PixelCarousel.Item>
            <img
              className="max-w-[350px] rounded-3xl border-4 border-red-500"
              src="src/assets/images/pac/thermos_pac.jpeg"
              alt="Test"
            />
            <span className="text-xs">thermos</span>
          </PixelCarousel.Item>
        </PixelCarousel>
      </center>
    </div>
  );
}
