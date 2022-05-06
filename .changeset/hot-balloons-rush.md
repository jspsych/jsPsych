---
"@jspsych/config": minor
---

Add the updatePluginVersions gulp task. This task looks at each of the docs/plugins markdown files, finds the page title and "Current version" string, adds the current version number (from the package.json file), and uses the package name as the page title.
