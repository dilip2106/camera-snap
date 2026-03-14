# Deploy to Production

## 1. Get Production API Token

1. Go to **My Lenses** → **Camera Kit** → **Apps** → **Snap web App**
2. Copy the **Production API Token** (not Staging)

## 2. Whitelist Your Production Domain

Before deploying, add your production URL to allowed domains in the Snap portal (My Lenses or Developer Portal). Example: `https://your-app.vercel.app`

## 3. Deploy

### Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → Import your repo
3. **Environment Variables** (add these):
   - `VITE_SNAP_API_TOKEN` = your **Production** API token
   - `VITE_SNAP_LENS_GROUP_ID` = `6d81a0b2-90e2-4ece-a97e-a32cd5710876`
4. Click **Deploy**
5. Your app will be at `https://your-app.vercel.app`

### Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**
3. Connect GitHub and select your repo
4. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Site settings** → **Environment variables** → Add:
   - `VITE_SNAP_API_TOKEN` = your **Production** API token
   - `VITE_SNAP_LENS_GROUP_ID` = `6d81a0b2-90e2-4ece-a97e-a32cd5710876`
6. Deploy

## 4. After Deploy

1. Whitelist the deployed URL in Snap portal (e.g. `https://your-app.vercel.app`)
2. Open the URL and test: Open Camera → allow camera → lens should apply
3. If you get 401, the domain is not whitelisted yet
