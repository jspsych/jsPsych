---
"@jspsych/config": major
---

Upgrade build tools to their latest versions. This doesn't introduce breaking changes to the artifacts built using `@jspsych/config`, but it requires some minor changes to projects using `@jspsych/config`:

- The minimum required Node.js version is now 16.10.0
- Jest has been upgraded from v28 to v29. If you are facing any issues due to this, please check Jest's [upgrade guide](https://jestjs.io/docs/upgrading-to-jest29) for instructions on updating your tests.
- TypeScript has been upgraded from version 4 to version 5. This is very unlikely to break anything in your code though.
