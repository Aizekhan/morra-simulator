# MORRA SIMULATOR — ARCHITECTURE & RESEARCH ROADMAP

**Status:** active audit  
**Audit baseline:** `main` at commit `7b3862f` (with visibility fixes subsequently applied)  
**Canonical rule:** simulation calibration values are provisional until explicitly accepted as world canon.

## Exact project goal

Build a deterministic, reproducible cosmology research simulator for Morra. The user can configure three stars and two moons, adjust their radii, orbital radii, periods/speeds, eccentricity, inclination, ascending node, source light/heat/magic output and planet rotation; accelerate/scrub time; select any point on the surface; and inspect conditions throughout time. The simulator must calculate and export reliable maps and time-series for illumination, darkness, heat flux, magic, eclipses, magosphere stability/anomalies and eventually tides. The 3D scene must visualize the same state the research engine computes. Presentation effects must never define or modify physics.

## Current audited stage

- Browser app built on Vite + TypeScript + Three.js.
- Three stellar bodies and two moons are instantiated from `MORRA_CONFIG`.
- Orbit math supports radius, eccentricity, inclination, ascending node, plane offsets and direction reversal.
- Simulation time, timeline, body inspector, environment inspector and configurable GUI exist.
- Surface grid is 64 × 128 and records light, heat, magic, source contributions, shadows, umbra/penumbra, spectrum/day-night diagnostics.
- Surface field is mapped onto Morra's own `MeshStandardMaterial` through the standard `emissiveMap` path; the fragile custom GLSL hook was removed after browser console errors showed GLSL compilation failures.
- Cones, shadow volumes and eclipse surface overlay exist, but are not yet validated as a consistent, physically accurate lighting/shadow solution.
- Latest CI: run #630 passed for `422bdfb` after replacing the custom GLSL patch with `emissiveMap`. CI proves TypeScript/Vite build integrity only, not browser rendering or physical correctness.
- Provisional configuration currently conflicts with the proposed research baseline: code says 30-hour day and 25° axial tilt, whereas research brief says 120-hour rotation and 0° tilt. Do not silently promote either to canon; introduce explicit named parameter profiles and owner-approved baseline.

## Current visibility issue — most likely cause

The planet is instantiated and forced visible; frustum culling is disabled. Its material is a `MeshStandardMaterial` with an asynchronously loaded world texture. A custom GLSL patch attempted to multiply `outgoingLight` by a DataTexture value and failed at runtime: the browser console showed literal `\\n` tokens, undeclared shader symbols and an invalid insertion point. The patch has now been removed and the physical display map is assigned as the material's standard `emissiveMap`; the initial map is neutral white so it does not erase the geographic surface before the first sample. Presentation lights from the three stars are also restored. Commit `422bdfb` passes CI, but a browser reload is still required to confirm visual behavior.

Other root-cause risks:
1. Avoided for the current surface field: no manual string replacement in Three.js shader chunks remains in `SurfaceFieldVisualizer`.
2. UV transform (`1-u, 1-v`) may not match the equirectangular world texture orientation.
3. Physical light samples are normalized to current min/max for display, losing absolute flux meaning.
4. Field recompute uses wall-clock rate limiting, so it can lag behind timeline seeks/config changes.
5. Presentation point lights from the three stars are enabled again; validate that their visual contribution and the emissive field display are not excessively bright.
6. A CI build can succeed while a runtime WebGL issue exists; the current fix eliminates this custom shader path, but still requires browser verification.

## Architecture rules (non-negotiable)

1. **Single time/state authority.** All bodies derive their positions from one simulation-time snapshot. Physics, fields, events, shadows and inspectors consume that same snapshot.
2. **Separate physics and presentation.** Render meshes, radiation cones, visual proxies, shader colors and camera distance never alter physical calculations.
3. **Explicit units.** Use one documented distance unit (currently the config comments imply km), hours for time, radians/hour internally for rates, radians internally for angles; convert UI degrees explicitly.
4. **Deterministic field cache.** Cache by simulation time and a parameter/config revision, not only wall-clock timers. Seeking to the same time and parameters must produce identical samples.
5. **No silent per-frame science normalization.** Keep raw light/heat/magic values separate from declared visualization transforms (fixed scale, log scale or percentile scale).
6. **Graceful rendering fallback.** A missing map, failed texture or shader compile error must not silently make the planet disappear/black out. Expose status, log actionable diagnostics and preserve an inspectable debug material.
7. **Pure calculation kernels.** Orbit geometry, source irradiance, sphere occlusion and eclipse overlap should be testable without WebGL or DOM.
8. **Budget expensive work.** Geometry does not rebuild each frame if inputs did not change. Research integration can run separately from interactive frame-rate rendering.
9. **Regression-first edits.** One focused fix at a time; run `npm run build`, analytical tests and WebGL/browser smoke checks. Never claim visual correctness from TypeScript build alone.
10. **Canon separation.** Values used for calibration are hypotheses until confirmed. Record which values are chosen for experimentation and which are approved canon.

## Phased roadmap

### Phase 0 — Restore visible, diagnosable baseline (P0)
- Confirm Morra remains visible before/after texture and field initialization.
- Add debug display modes: plain-color sphere, texture-only sphere, physical-light overlay, diagnostic map.
- Expose texture load state, field timestamp/min/max/finite sample count and active channel; custom surface-shader compile outcome is no longer applicable because the custom GLSL hook was removed.
- Test known UV test pattern; establish correct mapping rather than guessing flips.
- Avoid uninitialized zero texture; explicitly define how true night looks without corrupting geographic texture.

**Acceptance:** launch with no console/WebGL errors; textured planet visible; plain-color/texture-only/field modes switch independently; failed image/shader reports cause.

### Phase 1 — Deterministic astronomy and parameters (P0)
- Create an explicit parameter profile system: `research-default`, `canonical-approved`, and saved experiments. Do not change canon by changing a GUI control.
- Define system geometry: Morra stays at origin; two moons and three lights follow the explicitly chosen fantasy trajectories.
- Make all orbital positions derive from absolute simulation time and parameters with continuous phase.
- Validate circular and elliptical orbit solutions, inclinations, ascending nodes, reversal, eccentricity clamps and user edits.
- Reconcile the 120-hour/0° research brief with the current 30-hour/25° config through a named baseline—not a silent overwrite.

**Acceptance:** same time/profile yields same positions across repeated runs and timeline scrubs.

### Phase 2 — Direct light and occlusion (P1)
- Make one analytic kernel evaluate finite-source direct irradiance at a world-space surface point.
- Calculate each source independently, including inverse-square falloff, incidence angle, finite angular disc and partial occlusion by the first intersecting sphere.
- Keep light, heat and magic separate and apply each source's declared coefficients independently.
- Make cones a diagnostic view of the same rays; truncate them at the first body intersection. They are not the physics engine.
- Add tests for unobstructed, fully blocked, partial eclipse, tangent miss and smooth movement.

**Acceptance:** numerical test cases match analytic expectations and don't flicker when rendered inputs move continuously.

### Phase 3 — Exact surface eclipses (P1)
- For each stellar source and possible occluder, intersect shadow/ray geometry against Morra's sphere.
- Compute umbra and penumbra from finite angular sizes of source and occluder.
- Make shader visualize the calculated field; it must not independently invent different eclipse geometry.
- Check limb/grazing cases, partial-to-total transitions, occultations from both moons and overlaps from multiple sources.

**Acceptance:** one source/occluder/time produces the same eclipse fraction in point inspector, surface map and viewport.

### Phase 4 — Inspectable physical fields (P1)
- Point selection shows latitude/longitude, raw per-source light/heat/magic, visibility and eclipse fractions, total fields and magosphere/anomaly outputs.
- Provide declared display transforms separate from raw quantities.
- Invalidate cached fields on any relevant body/parameter/time changes.
- Render diagnostic fields without overwriting the world texture or altering raw physics.

**Acceptance:** selected-point values match the surface-grid sample within documented resolution tolerance.

### Phase 5 — Research sweeps and export (P2)
- Build a deterministic latitude/longitude grid and integrate over a fixed simulation-time step.
- For each cell accumulate: visible-light hours, fully dark hours, longest continuous night/day, heat-flux average/min/max/integral, magic-flux average/max, eclipse duration/fraction, magosphere stability and anomaly duration.
- Store run ID, parameter profile/hash, time interval, sampling step, grid resolution and engine version.
- Export CSV/JSON; provide reproducible before/after profile comparison.
- Repeat at higher spatial/time resolution and quantify convergence.

**Acceptance:** repeat identical run yields identical summary and data export; refinement changes results by a reported tolerance.

### Phase 6 — Cycles, climate proxies and canon comparison (P2/P3)
- Find true night, long nights, permanent/near-permanent illumination, local illumination cycles, moon periods, conjunctions and common alignments.
- Compute repeat cycles from actual configured periods/phases; don't assume the orbital period of one body defines a system-wide year.
- Start with radiation/heat-flux maps. Do not claim temperatures, seasons or climate without a surface heat-capacity/thermal-inertia and redistribution model.
- Specify a testable magosphere response/decay law before claiming gravity anomalies or floating-island regions.
- Add tidal approximations before naming stable tidal regions.
- Compare Kрижаний материк, Старі Землі, Сумрачні Землі and Летючий Архіпелаг only after terrain/map placement and climate criteria are defined.

**Acceptance:** each claimed region/cycle is linked to repeatable simulation output, not chosen lore.

## Research questions the finished tool must answer

1. For any point: total illuminated hours, completely dark hours, longest continuous night and longest continuous light period.
2. Candidate natural day: distinguish rotation period, local illumination cycle and magic-source cycle.
3. Period of each moon and conjunction/re-alignment cycles.
4. Common repeat period (if finite within practical horizon) of all three stars and both moons.
5. Cycles of maximum light, heat flux, magic and eclipse activity; label heat-flux cycles as proxies until thermal inertia exists.
6. Global/seasonal maps of mean light, heat flux, magic, eclipse fraction and magosphere stability.
7. Experiment with 90–100% blockage of the magic source; measure spatial response according to an explicitly defined magosphere model.
8. Track stable and moving low-stability corridors, with limits clearly stated until gravitational/tidal models are implemented.

## Immediate next actions

1. Wait for CI on the newest visibility-diagnostics commit and fix any build failures before more features.
2. In the browser, inspect `window.__MORRA_DIAGNOSTICS__` to see whether the body is visible, texture is loaded and the surface field has finite samples and a plausible range.
3. Verify plain-color and texture-only modes to isolate camera/geometry from shader/field issues.
4. Fix deterministic field invalidation/time dependence.
5. Add pure unit tests for orbit position, irradiance and ray/sphere occlusion.
6. Only after this baseline is reliable, continue physical shadow geometry and research accumulation.
