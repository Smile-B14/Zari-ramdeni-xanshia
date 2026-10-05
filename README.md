<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cc677994-00f4-44d1-9a59-56cdce6767a6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Repository layout

Application source lives in `src/`, with the existing component and service folders preserved. Run the existing commands from the repository root. HTML entry points, build configuration, environment files, and deployment entry points remain at the root.

### Moved files

| Previous path | Current path |
| --- | --- |
| `App.tsx` | [`src/App.tsx`](src/App.tsx) |
| `constants.ts` | [`src/constants.ts`](src/constants.ts) |
| `index.tsx` | [`src/index.tsx`](src/index.tsx) |
| `types.ts` | [`src/types.ts`](src/types.ts) |
