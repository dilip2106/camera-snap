# Snap Camera Kit Web Integration (React.js Implementation Plan)

---

# 1. Objective

Enable Snapchat Camera + AR Lens functionality inside our React-based web portal using Snap Camera Kit Web SDK.

Current State:
- Snapchat mobile app works.
- Web portal does NOT open camera.
- No Camera Kit SDK integrated.

Goal:
- Add browser-based camera support.
- Apply custom Snapchat Lens.
- Render AR inside React component.

---

# 2. Reference Documentation

Web SDK Sample:
https://camera-kit.snapchat.com/websdk/sample/basic

SDK Sources:
https://camera-kit.snapchat.com/websdk/sample/sources

Lens Reference:
https://my-lenses.snapchat.com/2ec65053-243a-42a3-934f-b4f9ca45818a/camera-kit/lens-scheduler/lenses/a8d91443-8895-404f-82ab-62a6c0062e09/references/59a7b816-2fc5-44d7-ba1e-d34898b52d34/sources/SNAPCHAT_USER_UNSET

Web Configuration Docs:
https://developers.snap.com/camera-kit/integrate-sdk/web/web-configuration

---

# 3. Architecture Overview

User Login
↓
User clicks "Open Camera"
↓
Initialize Camera Kit SDK
↓
Request webcam permission
↓
Load Lens from Snap Lens Repository
↓
Apply Lens to Session
↓
Render output to canvas

---

# 4. Required Setup (Before Coding)

## 4.1 Create Camera Kit App

In Snap Developer Portal:
- Create Camera Kit App
- Generate API Token
- Save securely

---

## 4.2 Add Allowed Domains

Add:
- http://localhost:3000
- https://your-production-domain.com

Without this:
Camera will NOT initialize.

---

# 5. Install SDK

```bash
npm install @snap/camera-kit
```

---

# 6. Folder Structure Recommendation

src/
 ├── components/
 │    └── SnapCamera/
 │         ├── SnapCamera.tsx
 │         ├── useSnapCamera.ts
 │         └── types.ts
 │
 ├── services/
 │    └── snapCameraService.ts
 │
 └── config/
      └── snapConfig.ts

---

# 7. Configuration File

## src/config/snapConfig.ts

```ts
export const SNAP_CONFIG = {
  apiToken: "YOUR_API_TOKEN",
  lensId: "YOUR_LENS_ID",
  lensGroupId: "YOUR_LENS_GROUP_ID"
};
```

---

# 8. Camera Service

## src/services/snapCameraService.ts

```ts
import { bootstrapCameraKit } from "@snap/camera-kit";
import { SNAP_CONFIG } from "../config/snapConfig";

export async function initializeSnapCamera(canvas: HTMLCanvasElement) {
  const cameraKit = await bootstrapCameraKit({
    apiToken: SNAP_CONFIG.apiToken,
  });

  const session = await cameraKit.createSession();
  session.output.live = canvas;

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  await session.setSource(
    await cameraKit.createMediaStreamSource(mediaStream)
  );

  await session.play();

  const lens = await cameraKit.lensRepository.loadLens(
    SNAP_CONFIG.lensId,
    SNAP_CONFIG.lensGroupId
  );

  await session.applyLens(lens);

  return session;
}
```

---

# 9. React Hook (Encapsulated Logic)

## src/components/SnapCamera/useSnapCamera.ts

```ts
import { useEffect, useRef, useState } from "react";
import { initializeSnapCamera } from "../../services/snapCameraService";

export function useSnapCamera() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    if (!canvasRef.current) return;

    try {
      setLoading(true);
      await initializeSnapCamera(canvasRef.current);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    canvasRef,
    startCamera,
    loading,
    error,
  };
}
```

---

# 10. React Component

## src/components/SnapCamera/SnapCamera.tsx

```tsx
import React from "react";
import { useSnapCamera } from "./useSnapCamera";

export default function SnapCamera() {
  const { canvasRef, startCamera, loading, error } = useSnapCamera();

  return (
    <div>
      <button onClick={startCamera} disabled={loading}>
        {loading ? "Starting..." : "Open Camera"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "500px" }}
      />
    </div>
  );
}
```

---

# 11. Add To Page

```tsx
import SnapCamera from "./components/SnapCamera/SnapCamera";

function App() {
  return (
    <div>
      <SnapCamera />
    </div>
  );
}
```

---

# 12. Important Notes

• HTTPS required in production  
• Camera permission must be granted  
• Domain must be whitelisted  
• Lens must be published  

---

# 13. Common Errors & Fix

Unauthorized domain:
→ Add domain in Snap Developer Portal

Invalid API token:
→ Check snapConfig.ts

Camera not opening:
→ Check browser permissions

Lens not applying:
→ Verify lensId and lensGroupId

---

# 14. Production Improvements (Recommended)

- Add Stop Camera functionality
- Add Session cleanup on component unmount
- Add Loader UI
- Add Fallback UI if camera unsupported
- Add Device selection (front/back camera)

---

# 15. Cleanup Logic (Advanced)

Add in useEffect:

```ts
useEffect(() => {
  return () => {
    session?.stop();
  };
}, []);
```

---

# 16. Final Summary

We are NOT using Snapchat Web login camera.

We are embedding Snap Camera Kit Web SDK directly inside our React app.

This is a separate integration from Snapchat mobile app.

---

# 17. Cursor Action Plan

1. Install SDK
2. Create config file
3. Create snapCameraService
4. Create custom hook
5. Create SnapCamera component
6. Add to main App
7. Test locally
8. Whitelist production domain
9. Deploy

---

# 18. Challenges & Execution Checklist

## Challenges (What to Watch For)

| Challenge | Why It Matters |
|-----------|----------------|
| **Domain whitelisting** | Camera Kit will not initialize unless the exact origin is added in the Snap Developer Portal. Easy to miss. |
| **HTTPS in production** | Webcam and Camera Kit require a secure context; production must be served over HTTPS. |
| **Browser permissions** | Users must grant camera access; denial or unsupported browsers need clear UX and fallbacks. |
| **Correct Lens IDs** | Wrong `lensId` or `lensGroupId` means the lens won’t apply; must match a published lens in the Lens Repository. |
| **API token security** | Token in frontend config is visible to clients; consider backend-issued tokens or proxy for production. |
| **Session cleanup** | Not stopping the session on unmount can leave the camera on and cause leaks; cleanup in `useEffect` return is important. |
| **SDK / browser support** | Camera Kit Web may have browser/version limits; plan for feature detection and “not supported” UI. |
| **Separate from Snapchat login** | This is Camera Kit in your own web app, not “Snapchat login camera”; set expectations with stakeholders. |

## Execution Checklist

**Pre-coding (Snap Developer Portal)**

- [ ] Create Camera Kit App
- [ ] Generate API Token and store securely
- [ ] Add allowed domain: `http://localhost:3000`
- [ ] Note production domain for later: `https://your-production-domain.com`
- [ ] Confirm lens is published; copy `lensId` and `lensGroupId`

**Implementation**

- [ ] Install SDK: `npm install @snap/camera-kit`
- [ ] Create `src/config/snapConfig.ts` (apiToken, lensId, lensGroupId)
- [ ] Create `src/services/snapCameraService.ts`
- [ ] Create `src/components/SnapCamera/useSnapCamera.ts`
- [ ] Create `src/components/SnapCamera/SnapCamera.tsx`
- [ ] Add `<SnapCamera />` to main App
- [ ] Add cleanup logic (session stop on unmount)

**Testing & Deploy**

- [ ] Test locally (camera opens, lens applies)
- [ ] Whitelist production domain in Snap Developer Portal
- [ ] Deploy over HTTPS and verify camera + lens in production

---

# 19. Phases to Achieve Required Output

High-level phases and steps to get from zero to a working web app with camera + Lens.

---

## Phase 1: Setup & credentials (no code)

| Step | Action | Outcome |
|------|--------|---------|
| 1.1 | Create Camera Kit App in [Snap Developer Portal](https://developers.snap.com) | App created |
| 1.2 | Generate API Token; store securely (e.g. env or secrets) | Token ready for config |
| 1.3 | Add allowed domain: `http://localhost:3000` | SDK will work locally |
| 1.4 | Get published Lens: copy `lensId` and `lensGroupId` from Lens Repository | Lens IDs for config |

**Exit criteria:** You have API token + lens IDs + localhost whitelisted.

---

## Phase 2: Project & SDK setup

| Step | Action | Outcome |
|------|--------|---------|
| 2.1 | Ensure React app exists (e.g. Vite/CRA) in repo | App runs locally |
| 2.2 | Install SDK: `npm install @snap/camera-kit` | Dependency added |
| 2.3 | Create `src/config/snapConfig.ts` with apiToken, lensId, lensGroupId | Config in place |

**Exit criteria:** App runs; config file has valid values (token/lens IDs).

---

## Phase 3: Core integration (camera + Lens)

| Step | Action | Outcome |
|------|--------|---------|
| 3.1 | Create `src/services/snapCameraService.ts`: bootstrap Camera Kit, create session, set canvas, get getUserMedia, set source, play, load lens, apply lens | Service ready |
| 3.2 | Create `src/components/SnapCamera/useSnapCamera.ts`: canvasRef, startCamera, loading, error | Hook encapsulates logic |
| 3.3 | Create `src/components/SnapCamera/SnapCamera.tsx`: button, canvas, error display | UI component ready |
| 3.4 | Add session cleanup on unmount (e.g. in hook: session?.stop()) | No camera leak on navigate away |
| 3.5 | Mount `<SnapCamera />` in App (or target page) | Camera available in app |

**Exit criteria:** User can click “Open Camera”, grant permission, see camera feed with Lens applied.

---

## Phase 4: Test & fix locally

| Step | Action | Outcome |
|------|--------|---------|
| 4.1 | Run app at `http://localhost:3000` (must match whitelist) | Same origin as Snap config |
| 4.2 | Click “Open Camera”; grant camera permission | Feed appears |
| 4.3 | Verify Lens applies (AR effect visible) | Lens working |
| 4.4 | Fix any errors (domain, token, lens IDs — see §13 Common Errors) | Stable locally |

**Exit criteria:** Camera + Lens work reliably on localhost.

---

## Phase 5: Production readiness & deploy

| Step | Action | Outcome |
|------|--------|---------|
| 5.1 | Add production domain in Snap Developer Portal (e.g. `https://your-domain.com`) | SDK allowed in prod |
| 5.2 | Ensure app is served over HTTPS in production | Required for webcam/Camera Kit |
| 5.3 | (Optional) Move API token to env/build-time or backend proxy | Better security |
| 5.4 | Deploy app; smoke-test camera + Lens on production URL | Required output live |

**Exit criteria:** Same behavior in production as locally (web-only).

---

## Phase 6: Improvements (optional)

| Step | Action | Outcome |
|------|--------|---------|
| 6.1 | Add “Stop camera” button and cleanup | Better UX |
| 6.2 | Add loader / fallback UI when camera unsupported or denied | Clear feedback |
| 6.3 | Add device selection (front/back) if needed | Multi-camera support |

---

## Summary flow

```
Phase 1 (Setup) → Phase 2 (Project/SDK) → Phase 3 (Core integration) → Phase 4 (Test) → Phase 5 (Deploy) → [Phase 6 (Improvements)]
```

**Required output:** Web app (React) where user can open camera and see Snap Lens applied; web-only; works on localhost and production (HTTPS).

---

END OF DOCUMENT
