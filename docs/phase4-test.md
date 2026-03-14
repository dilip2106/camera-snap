# Phase 4: Test locally

1. **Add your credentials** (from Phase 1):
   - Copy `.env.example` to `.env`
   - Set `VITE_SNAP_API_TOKEN`, `VITE_SNAP_LENS_ID`, and `VITE_SNAP_LENS_GROUP_ID` with your real values

2. **Start the dev server** (must run on port 3000 to match Snap whitelist):
   ```bash
   npm run dev
   ```

3. **Open** `http://localhost:3000` in your browser.

4. **Click "Open Camera"** → allow camera permission → confirm the Lens AR effect appears.

5. **If you see errors:** see §13 Common Errors in `docs/mvp.md` (domain, token, lens IDs, permissions).

**Exit criteria:** Camera opens and Lens applies reliably on localhost.
