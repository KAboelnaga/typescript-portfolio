# Project preview images/videos

How to change what shows up in the popup beside a project card on hover
(`ProjectPreviewPopup.tsx`), including swapping out an auto-captured
screenshot you don't like (e.g. Pet Society's current one — see below).

## Where it's wired

Each project in [`src/data/projects.ts`](./src/data/projects.ts) can set:

- `previewImage` — path to a still image, e.g. `/previews/pet-society.png`
- `previewVideo` — path to a video (autoplay, muted, loop). Takes priority
  over `previewImage` if both are set on the same project.

Neither field is required. A project with neither set just doesn't show a
popup on hover — that's the default, not a bug.

## Where the files go

Drop the actual image/video file in [`public/previews/`](./public/previews/),
then reference it in `data/projects.ts` with a leading `/` (not
`./public/...` — Vite serves everything under `public/` from the site
root):

```ts
previewImage: '/previews/your-file.png',
```

## Replacing Pet Society's current image

Right now it's a screenshot of the site's sign-in screen, captured
automatically since the app is behind auth and there's no demo account to
get past it — accurate, but not a great preview. To swap it for something
better (an in-app screenshot, a GIF turned into a short video, etc.):

1. Save your image as `public/previews/pet-society.png` (overwrite the
   existing one), or save it under a new filename.
2. If you used a new filename, update the `previewImage` line for the
   `pet-society` entry in `src/data/projects.ts` to match.
3. That's it — no other code changes needed.

## Sizing

The popup itself renders at a fixed 320×220px box (`POPUP_WIDTH` /
`POPUP_HEIGHT` in `ProjectPreviewPopup.tsx`) and the image/video is
cropped to fill it (`object-cover`), so:

- Roughly landscape, wider than tall, works best — very tall/narrow
  images will get cropped hard on the sides.
- The source file can be any resolution above that — it'll scale down.
  No need to pre-resize to exactly 320×220.
- For video: keep it short and silent (it plays muted regardless, so
  audio in the file is wasted bytes) — a few seconds looping is plenty.

## Adding a preview to a project that doesn't have one

Same two steps as above: put the file in `public/previews/`, then add a
`previewImage` (or `previewVideo`) line to that project's entry in
`src/data/projects.ts`.
