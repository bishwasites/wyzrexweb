// Shared constants for the admin media-upload flow. The actual upload
// happens client-direct via `upload()` from `@vercel/blob/client`
// (components/admin/UploadField.tsx) against the token issued by
// app/api/admin/upload/route.ts — nothing here touches Blob storage
// directly, this just keeps the allow-list in one place.

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const ALLOWED_UPLOAD_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export const MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024; // 200MB, comfortably covers short case-study video clips
