# Birthday Fairytale

React + Vite + React Three Fiber + Drei + GSAP + Tailwind 4.

## Run
```
npm install
npm run dev        # development
npm run build      # outputs dist/
npm run preview    # test the production build
```
Deploy `dist/` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

## Customize (all in `src/data/content.js`)
Name, banner text/image, music path, optional voice message, photos + captions, flower messages, letter lines, finale text.
- Photos: put files in `public/photos/` (1.jpg … 4.jpg or change paths). Missing photos show a coloured placeholder.
- Music: `public/audio/music.mp3`. Missing audio is ignored without errors.
- Garden backdrop: `public/garden.png` (your reference image).

## Flow
Heart → Celebration → View Surprise → Garden (roses & stars) → Memory gallery → Letter → Finale → Cake → Replay.

## Not included yet
Garden map, secret locations, ambient garden audio, distant birds, glowing gallery lines, GLB models.
Low-end devices (small screens / ≤4 cores) get fewer particles, lights and no bloom.
# Birthday
