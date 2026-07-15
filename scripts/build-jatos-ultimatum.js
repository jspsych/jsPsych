#!/usr/bin/env node
// Assembles a JATOS-ready study archive for the multiplayer ultimatum game.
// Copies built dist files into a flat folder and rewrites <script src> paths,
// then zips the result for import into JATOS.
//
// Usage: node scripts/build-jatos-ultimatum.js
// Output: dist/ultimatum-jatos.zip

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildAssetsAndMetadata, zipStudy } from "./lib/build-jatos-study.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── Assets to bundle ─────────────────────────────────────────────────────────
const assets = [
  { src: "packages/jspsych/dist/index.browser.js", dest: "jspsych.js" },
  { src: "packages/jspsych/css/jspsych.css", dest: "jspsych.css" },
  {
    src: "packages/plugin-html-button-response/dist/index.browser.js",
    dest: "plugin-html-button-response.js",
  },
  {
    src: "packages/plugin-html-keyboard-response/dist/index.browser.js",
    dest: "plugin-html-keyboard-response.js",
  },
  { src: "packages/adapter-multiplayer-jatos/dist/index.browser.js", dest: "jatos-adapter.js" },
  {
    src: "packages/plugin-multiplayer-sync/dist/index.browser.js",
    dest: "plugin-multiplayer-sync.js",
  },
];

// ── Path rewrites in the HTML ─────────────────────────────────────────────────
// Maps the original src/href values to their flat equivalents.
const pathRewrites = {
  "../packages/jspsych/dist/index.browser.js": "jspsych.js",
  "../packages/jspsych/css/jspsych.css": "jspsych.css",
  "../packages/plugin-html-button-response/dist/index.browser.js": "plugin-html-button-response.js",
  "../packages/plugin-html-keyboard-response/dist/index.browser.js":
    "plugin-html-keyboard-response.js",
  "../packages/adapter-multiplayer-jatos/dist/index.browser.js": "jatos-adapter.js",
  "../packages/plugin-multiplayer-sync/dist/index.browser.js": "plugin-multiplayer-sync.js",
};

const STUDY_DIR_NAME = "ultimatum-jatos";

// ── Build ─────────────────────────────────────────────────────────────────────
// JATOS 3.x archive structure:
//   ultimatum-jatos.jas   ← study metadata at zip root (must have .jas extension)
//   ultimatum-jatos/      ← study assets folder (must match dirName)
//     index.html
//     jspsych.js
//     ...

const { distDir, assetsDir, jasFileName } = buildAssetsAndMetadata({
  root,
  studyDirName: STUDY_DIR_NAME,
  assets,
  studyMeta: {
    title: "Multiplayer Ultimatum Game",
    description: "Two-player ultimatum game built with jsPsych.",
    componentTitle: "Ultimatum Game",
    batch: { maxActiveMembers: 2, maxTotalMembers: 2 },
  },
});

let html = readFileSync(resolve(root, "examples/multiplayer-ultimatum-game-sync.html"), "utf8");
for (const [original, replacement] of Object.entries(pathRewrites)) {
  html = html.replaceAll(original, replacement);
}
writeFileSync(resolve(assetsDir, "index.html"), html);
console.log(`  wrote   ${STUDY_DIR_NAME}/index.html`);

// ── Zip ───────────────────────────────────────────────────────────────────────
const zipName = "ultimatum-jatos.jzip";
zipStudy({ distDir, assetsDir, jasFileName, studyDirName: STUDY_DIR_NAME, zipName });

console.log(`\n  Import dist/${zipName} into JATOS via the Import Study button.`);
