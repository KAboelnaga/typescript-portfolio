# Project preview images/videos

How to change what shows up in the popup beside a project card on hover
(`ProjectPreviewPopup.tsx`).

## Where it's wired

Each project in [`src/data/projects.ts`](./src/data/projects.ts) can set:

- `previewImage` — path to a still image, e.g. `/previews/xray.png`
- `previewVideo` — path to a video (autoplay, muted, loop). Takes priority
  over `previewImage` if both are set on the same project.

Neither field is required. A project with neither set just doesn't show a
popup on hover — that's the default, not a bug.

**Current images, all real screenshots Kareem provided (2026-08-10):**
Pet Society → `pet-society-homepage.png`, PneumoXpert → `xray.png`, Movie
Discovery App → `movies.png`, Django Blog Platform → `blog.png`. Every
project with a viewable UI now has a real preview.

## Where the files go

Drop the actual image/video file in [`public/previews/`](./public/previews/),
then reference it in `data/projects.ts` with a leading `/` (not
`./public/...` — Vite serves everything under `public/` from the site
root):

```ts
previewImage: '/previews/your-file.png',
```

## Replacing an existing image

1. Save your new image under `public/previews/`, either overwriting the
   existing filename or under a new one.
2. If you used a new filename, update that project's `previewImage` line
   in `src/data/projects.ts` to match.
3. That's it — no other code changes needed.

## Sizing

The popup itself renders at a fixed 480×330px box (`POPUP_WIDTH` /
`POPUP_HEIGHT` in `ProjectPreviewPopup.tsx`) and the image/video is
cropped to fill it (`object-cover`), so:

- Roughly landscape, wider than tall, works best — very tall/narrow
  images will get cropped hard on the sides.
- The source file can be any resolution above that — it'll scale down.
  No need to pre-resize to exactly 480×330.
- For video: keep it short and silent (it plays muted regardless, so
  audio in the file is wasted bytes) — a few seconds looping is plenty.

## Adding a preview to a project that doesn't have one

Same two steps as above: put the file in `public/previews/`, then add a
`previewImage` (or `previewVideo`) line to that project's entry in
`src/data/projects.ts`.
