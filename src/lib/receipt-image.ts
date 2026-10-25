// 3 MB decoded keeps the base64 JSON body under Vercel's 4.5 MB request limit
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024

// Decoded size of a base64 data URL (or bare base64 string), without decoding it
export function decodedByteLength(image: string) {
  const base64 = image.slice(image.indexOf(",") + 1)
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - padding
}
