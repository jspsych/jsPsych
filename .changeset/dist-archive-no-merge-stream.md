---
"@jspsych/config": patch
---

Fix `createCoreDistArchive` dropping plugins from `dist.zip`. Recent release archives were missing the alphabetical tail of `dist/*.js` (e.g. `plugin-survey-multi-*`, `plugin-video-*`, `plugin-virtual-chinrest`, `plugin-visual-search-circle`, the `plugin-webgazer-*` plugins) along with some `examples/*.html` files. Under gulp 5's streamx-based Vinyl, `merge-stream` would race with `gulp-zip` and finalize the archive before slow upstreams (notably the 3 MB `plugin-survey/dist/index.browser.js`) had finished flushing. The task now drains every substream first and feeds the collected files into `gulp-zip` from a single ordered stream.
