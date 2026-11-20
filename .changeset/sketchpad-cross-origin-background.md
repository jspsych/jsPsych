---
"@jspsych/plugin-sketchpad": patch
---

Load `background_image` with `crossOrigin = "anonymous"` when `save_final_image` is true, so cross-origin images served with CORS headers no longer taint the canvas and break saving the PNG. If the server does not allow CORS, the image is loaded without it as before, and `png` is set to `null` with a console warning instead of the trial throwing an error.
