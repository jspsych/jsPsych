#!/usr/bin/env node
// Assembles a JATOS-ready study archive for the multiplayer ultimatum game.
// Copies built dist files into a flat folder and rewrites <script src> paths,
// then zips the result for import into JATOS.
//
// Usage: node scripts/build-jatos-ultimatum.js
// Output: dist/ultimatum-jatos.zip

import { execSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createWriteStream } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "dist/ultimatum-jatos");

// ── Assets to bundle ─────────────────────────────────────────────────────────
const assets = [
  { src: "packages/jspsych/dist/index.browser.js", dest: "jspsych.js" },
  { src: "packages/jspsych/css/jspsych.css", dest: "jspsych.css" },
  { src: "packages/plugin-call-function/dist/index.browser.js", dest: "plugin-call-function.js" },
  {
    src: "packages/plugin-html-button-response/dist/index.browser.js",
    dest: "plugin-html-button-response.js",
  },
  {
    src: "packages/plugin-html-keyboard-response/dist/index.browser.js",
    dest: "plugin-html-keyboard-response.js",
  },
  { src: "packages/adapter-multiplayer-jatos/dist/index.browser.js", dest: "jatos-adapter.js" },
];

// ── Path rewrites in the HTML ─────────────────────────────────────────────────
// Maps the original src/href values to their flat equivalents.
const pathRewrites = {
  "../packages/jspsych/dist/index.browser.js": "jspsych.js",
  "../packages/jspsych/css/jspsych.css": "jspsych.css",
  "../packages/plugin-call-function/dist/index.browser.js": "plugin-call-function.js",
  "../packages/plugin-html-button-response/dist/index.browser.js": "plugin-html-button-response.js",
  "../packages/plugin-html-keyboard-response/dist/index.browser.js":
    "plugin-html-keyboard-response.js",
  "../packages/adapter-multiplayer-jatos/dist/index.browser.js": "jatos-adapter.js",
};

const STUDY_DIR_NAME = "ultimatum-jatos";

// ── JATOS study metadata ──────────────────────────────────────────────────────
// JATOS requires this at the root of the archive to recognise it as a valid study.
const metadata = {
  version: "3",
  data: {
    title: "Multiplayer Ultimatum Game",
    description: "Two-player ultimatum game built with jsPsych.",
    groupStudy: true,
    dirName: STUDY_DIR_NAME,
    comments: "",
    jsonData: null,
    endRedirectUrl: null,
    componentList: [
      {
        title: "Ultimatum Game",
        htmlFilePath: "index.html",
        reloadable: false,
        active: true,
        comments: "",
        jsonData: null,
      },
    ],
    batchList: [
      {
        title: "Default",
        active: true,
        maxActiveMembers: 2,
        maxTotalMembers: null,
        maxTotalWorkers: null,
        allowedWorkerTypes: ["Jatos", "GeneralSingle", "GeneralMultiple"],
        comments: null,
        jsonData: null,
      },
    ],
  },
};

// ── Build ─────────────────────────────────────────────────────────────────────
// JATOS archive structure:
//   jatos_study_metadata.json   ← at zip root
//   ultimatum-jatos/            ← study assets folder (must match dirName)
//     index.html
//     jspsych.js
//     ...

const distDir = resolve(root, "dist");
const assetsDir = resolve(distDir, STUDY_DIR_NAME);

rmSync(assetsDir, { recursive: true, force: true });
mkdirSync(assetsDir, { recursive: true });

for (const { src, dest } of assets) {
  cpSync(resolve(root, src), resolve(assetsDir, dest));
  console.log(`  copied  ${src} → ${STUDY_DIR_NAME}/${dest}`);
}

let html = readFileSync(resolve(root, "examples/multiplayer-ultimatum-game.html"), "utf8");
for (const [original, replacement] of Object.entries(pathRewrites)) {
  html = html.replaceAll(original, replacement);
}
writeFileSync(resolve(assetsDir, "index.html"), html);
console.log(`  wrote   ${STUDY_DIR_NAME}/index.html`);

writeFileSync(resolve(distDir, "jatos_study_metadata.json"), JSON.stringify(metadata, null, 2));
console.log(`  wrote   jatos_study_metadata.json`);

// ── Zip ───────────────────────────────────────────────────────────────────────
const zipName = "ultimatum-jatos.jzip";
rmSync(resolve(distDir, zipName), { force: true });
execSync(`cd "${distDir}" && zip -r ${zipName} jatos_study_metadata.json ${STUDY_DIR_NAME}/`);
console.log(`\n  zipped  dist/${zipName}`);
console.log(`\n  Import dist/${zipName} into JATOS via the Import Study button.`);
