---
"@jspsych/config": patch
---

Bump build-time dependencies to clear security advisories: `esbuild` to `^0.25.0` (dev-server CORS advisory), `rollup` to `^4.59.0` (path-traversal and DOM-clobbering advisories), and `rollup-plugin-esbuild` to `6.2.1`. These are build-tooling dependencies, so there is no change to runtime behavior.
