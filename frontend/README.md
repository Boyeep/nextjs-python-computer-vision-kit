# Frontend

The frontend is a Next.js app that gives the template a product-shaped, detection-first starting point instead of a blank upload form.

## Responsibilities

- present the vision starter as a real app shell
- make upload-and-detect the clearest onboarding flow
- render typed results from the OpenAPI contract
- display segmentation regions when a pipeline returns them
- extend into webcam capture without creating a second API surface

## Run

```bash
npm run dev
```

## Checks

```bash
npm run lint:strict
npm run typecheck
npm run build
```
