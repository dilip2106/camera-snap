/**
 * Snap Camera Kit config.
 * Replace placeholders with your values from Phase 1, or use .env (VITE_*).
 */
const apiToken =
  import.meta.env.VITE_SNAP_API_TOKEN ?? 'YOUR_API_TOKEN'
const lensId =
  import.meta.env.VITE_SNAP_LENS_ID ?? 'YOUR_LENS_ID'
const lensGroupId =
  import.meta.env.VITE_SNAP_LENS_GROUP_ID ?? 'YOUR_LENS_GROUP_ID'

export const SNAP_CONFIG = {
  apiToken,
  lensId,
  lensGroupId,
} as const
