---
"jspsych": patch
---

Fixed a bug where the `data` trial parameter set on a nested timeline node was not overridden by a same-named `data` property set on a more deeply nested node, unlike every other trial parameter. `data` properties from parent timelines are still merged in, but a nested node's own value for a given key now takes precedence, and (as with all other parameters) does not deep-merge with a parent's value for that key — it fully replaces it. Resolves #3714.
