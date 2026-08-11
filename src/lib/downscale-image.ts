"use client";

// Browser-side image shrinking, run before anything reaches the bucket.
//
// Only the screenshot fallback of an UploadTask goes through here. A phone or
// retina screenshot arrives at 3–8 MB, and none of it is ever displayed larger
// than a teacher's review pane — so the full-size original would cost bucket
// space forever and egress on every review, for no visible gain. Shrinking at
// the source means the heavy file never exists server-side at all, which
// matters on Supabase's free tier (1 GB stored, 5 GB egress/month).
//
// Runs on the client deliberately: uploading straight from the browser to
// Storage keeps a multi-megabyte body out of our own API route entirely.
//
// Adapted from the same approach in the BookOfUs project.

/** Big enough to read a Workbench window; far below what a screenshot arrives at. */
const MAX_EDGE = 1600;
const QUALITY = 0.8;

export type Downscaled = { blob: Blob; extension: string };

/** WebP where supported (every browser this app targets), JPEG as the floor. */
function pickOutputType(): { mime: string; extension: string } {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? { mime: "image/webp", extension: "webp" }
    : { mime: "image/jpeg", extension: "jpg" };
}

export async function downscaleImage(file: File): Promise<Downscaled> {
  // `from-image` applies the EXIF orientation flag, so a photo taken sideways
  // isn't baked in rotated — the classic "it was upright in my camera roll".
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Couldn't prepare that image for upload.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const { mime, extension } = pickOutputType();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, QUALITY));
  if (!blob) throw new Error("Couldn't prepare that image for upload.");

  return { blob, extension };
}
