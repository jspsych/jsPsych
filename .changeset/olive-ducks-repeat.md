---
"@jspsych/config": minor
---

Require Node 20 or later. Node 18 reached end of life in April 2025, and parts of the ecosystem have moved past it — the Firebase v12 SDK, for one, declares `node >= 20` throughout, so a package depending on it could not be installed in a repository that still claimed Node 18 support.

A `minor` rather than a `major`: raising a runtime floor is breaking in the strict sense, but `@jspsych/config` is a build-time dependency of jsPsych's own packages and never reaches an experiment, so a major here would churn every package in the monorepo for an advisory field.
