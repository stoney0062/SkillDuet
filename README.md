# SkillDuet project page

A local, buildless research project page for **SkillDuet: Co-Evolving Models and Skills through Response Feedback**.

## Open

Open `index.html` directly in a modern browser. All page assets are local; no package installation, CDN, or build is required.

For an HTTP preview, run from this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8000>. Stop the server with `Ctrl+C`.

## Files

- `index.html`: research content and accessible page structure.
- `styles.css`: responsive paper-white theme and SVG/CSS animation.
- `script.js`: keyboard-accessible tabs, benchmark switching, figure viewer, and citation copying.
- `animations.js` and `animations.css`: six-chapter learning film and three cinematic examples, with a shared animation clock, looping playback, pause, chapter navigation, a scrubber, and speed controls.
- `assets/`: web-optimized renders of the paper's original figures and the page favicon.
- `2611.12109v1-skillduet/`: original arXiv v1 PDF, LaTeX archive, and extracted source.

## Animation

The learning film supports play/pause, six selectable chapters, restart, timeline scrubbing, and playback speeds of 0.75× / 1× / 1.25× / 1.5×. Both players default to 1.5×: approximately 25 seconds per learning loop and 13 seconds per example. They loop automatically while visible and pause when the page is hidden or the player leaves the viewport. A single clock synchronizes animations, timeline progress, and playback controls. Motion effects and autoplay respect `prefers-reduced-motion`.

Three additional examples animate Clean task ordering, WebShop required-attribute checks, and the recorded hierarchical Global synthesis. Token sequences are explanatory reconstructions rather than model trace replays. Recorded outcomes and counts are labeled with their source appendix.

Action text remains readable from the first frame, with sequential token emphasis. In the Clean example, the knife and its tracking label move together; object state and water flow follow the same seekable playback clock.

The animation explains the method rather than replaying an actual training run. It distinguishes all eligible Local skills used for OPD from the subset selected for Global consolidation. Strength scoring occurs before the policy update at skill generation, even though the explainer introduces the parameter-learning branch before explaining the selection branch. Consolidation occurs every ten training steps; the six animation steps are explanatory stages, not six training steps.

## Content provenance

Authors, affiliation, method, and experimental values come from `2611.12109v1-skillduet/src/main.tex`. Original figures are rendered from `src/figures/`. Benchmark values use the reproduced-method rows of Table 1. Historical candidate-pool, retention, and fixed-parameter experiments are labeled separately to avoid mixing evaluation protocols.

Paper figures retain their original provenance; this project does not assign a new license to them. No model-weight or research-code release is claimed. The LaTeX download is the paper source, not the method implementation.
