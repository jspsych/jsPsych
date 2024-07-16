---
"@jspsych/config": major
---

Migrate the build chain from TypeScript, Babel, and Terser to [esbuild](https://esbuild.github.io/). Babel and Terser are no longer included as dependencies and the Babel configuration at `@jspsych/config/babel` has been removed. The minified browser builds are only transpiled down to [ES2015](https://caniuse.com/es6) now.
