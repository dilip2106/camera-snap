# Pre-Push Test Checklist

## MVP Requirements vs Implementation

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Open camera on click** | ✅ | "Open Camera" button works |
| **Apply Snap Lens** | ✅ | Loads from lens group, applies first lens |
| **Render AR to canvas** | ✅ | Uses `liveRenderTarget` |
| **Stop camera** | ✅ | "Stop Camera" button with cleanup |
| **Session cleanup on unmount** | ✅ | `useEffect` return stops session + tracks |
| **Loader UI** | ✅ | "Starting…" / "Stopping…" states |
| **Error display** | ✅ | Red error message when lens/API fails |
| **Web-only** | ✅ | Camera Kit Web SDK, no mobile |
| **Config from env** | ✅ | `VITE_SNAP_*` in .env / .env.production |

## Optional (Phase 6) — Implemented

| Item | Status |
|------|--------|
| Capture button (snapshot) | ✅ Downloads PNG of current frame |
| Fallback UI if camera denied | ✅ Shows message + "Try again" button |
| Fallback UI if camera unsupported | ✅ Shows "Camera not supported" message |
| Device selection (front/back) | ✅ Dropdown when multiple cameras |

## Build & Run Tests

- [x] `npm run build` — succeeds
- [ ] `npm run dev` — start at localhost:3000, click Open Camera
- [ ] `npm run preview` — test production build locally

## Manual Test Steps (before push)

1. **Dev mode:** `npm run dev` → open http://localhost:3000
   - [ ] Click "Open Camera" → camera opens
   - [ ] Lens applies (AR effect visible)
   - [ ] Click "Capture" → PNG downloads
   - [ ] If multiple cameras: dropdown appears, switch works
   - [ ] Click "Stop Camera" → camera stops, feed clears
   - [ ] No red errors (except [I][SnapRHI] info logs — ignore)

2. **Fallback UI (camera denied):** Block camera in browser → refresh → click Open Camera
   - [ ] "Camera access denied" message + "Try again" button shown

3. **Production build:** `npm run preview` → open the URL shown
   - [ ] Same flow works with production token

4. **After deploy:** Test on production URL
   - [ ] Whitelist domain in Snap portal first
   - [ ] Camera + lens work over HTTPS
