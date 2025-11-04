import type { ReactEventHandler } from "react";

// Fallback image to use when the original image fails to load
export const FALLBACK_IMG = "https://picsum.photos/200/300/?blur";

/**
 * Returns a safe image URL. If the input is empty, undefined, or invalid,
 * returns the fallback image URL.
 */
export const getSafeImageSrc = (src: string | undefined | null): string => {
  if (!src || src.trim() === "") {
    return FALLBACK_IMG;
  }
  return src;
};

/**
 * Reusable onError handler for <img> tags.
 * Swaps to fallback image when loading fails.
 */
export const onImgError: ReactEventHandler<HTMLImageElement> = (e) => {
  const img = e.currentTarget;
  // Prevent infinite loop if the fallback also fails
  if (!img || img.src === FALLBACK_IMG) return;
  img.onerror = null;
  img.src = FALLBACK_IMG;
};

/**
 * Reusable onLoad handler for <img> tags.
 * Checks if the image actually loaded successfully (non-zero dimensions).
 * If the image failed to render (0x0), swaps to fallback.
 */
export const onImgLoad: ReactEventHandler<HTMLImageElement> = (e) => {
  const img = e.currentTarget;
  if (!img) return;
  
  // If image loaded but has 0 width/height, it likely failed
  if (img.naturalWidth === 0 || img.naturalHeight === 0) {
    if (img.src !== FALLBACK_IMG) {
      img.src = FALLBACK_IMG;
    }
  }
};
