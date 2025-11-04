import type { ReactEventHandler } from "react";

// Fallback image to use when the original image fails to load
export const FALLBACK_IMG = "https://picsum.photos/200/300/?blur";

// Reusable onError handler for <img> tags
export const onImgError: ReactEventHandler<HTMLImageElement> = (e) => {
  const img = e.currentTarget;
  // Prevent infinite loop if the fallback also fails
  if (!img || img.src === FALLBACK_IMG) return;
  img.onerror = null;
  img.src = FALLBACK_IMG;
};
