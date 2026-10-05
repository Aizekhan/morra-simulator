# МОРРА — Simulator

3D/physics simulator for the world of Morra.

## Local launch

Requirements: Node.js + npm.

```bash
npm install
npm run dev
```

Vite will print the local address in the terminal (usually `http://localhost:5173`).

## Working with ChatGPT + GitHub

The working branch is `main`.

When ChatGPT pushes a new version to GitHub, update the already-cloned project in the VS Code terminal:

```bash
git pull origin main
```

If the Vite server is already running, most source changes will reload automatically.

If dependencies were changed in `package.json`, run:

```bash
npm install
npm run dev
```

## Important project rule

Simulation calibration values are not automatically canon.

The simulator may contain provisional values for scale, orbital radii, speeds, illumination, radiation and other physical parameters. Canonical worldbuilding decisions are confirmed separately before being treated as canon.
