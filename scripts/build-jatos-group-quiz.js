#!/usr/bin/env node
// Assembles a JATOS-ready study archive for the Group Quiz demo.
// Produces dist/group-quiz-jatos.jzip with one component (index.html) that
// contains a landing page where participants self-select Host or Player.
//
// Usage: node scripts/build-jatos-group-quiz.js
//
// NOTE: This script copies pre-built dist files from packages/. If you changed
// any package source since the last build, run `npm run build` first or the
// jzip will contain stale output.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildAssetsAndMetadata, zipStudy } from "./lib/build-jatos-study.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STUDY_DIR_NAME = "group-quiz-jatos";

// ── All assets needed by the single component ─────────────────────────────────
const assets = [
  { src: "packages/jspsych/css/jspsych.css", dest: "jspsych.css" },
  { src: "packages/jspsych/dist/index.browser.js", dest: "jspsych.js" },
  { src: "packages/adapter-multiplayer-jatos/dist/index.browser.js", dest: "jatos-adapter.js" },
  { src: "packages/plugin-call-function/dist/index.browser.js", dest: "plugin-call-function.js" },
  {
    src: "packages/plugin-html-button-response/dist/index.browser.js",
    dest: "plugin-html-button-response.js",
  },
  {
    src: "packages/plugin-html-keyboard-response/dist/index.browser.js",
    dest: "plugin-html-keyboard-response.js",
  },
  {
    src: "packages/plugin-multiplayer-sync/dist/index.browser.js",
    dest: "plugin-multiplayer-sync.js",
  },
  { src: "examples/group-quiz/protocol.js", dest: "protocol.js" },
  { src: "examples/group-quiz/questions.js", dest: "questions.js" },
];

// ── Build ─────────────────────────────────────────────────────────────────────
const { distDir, assetsDir, jasFileName } = buildAssetsAndMetadata({
  root,
  studyDirName: STUDY_DIR_NAME,
  assets,
  studyMeta: {
    title: "Group Quiz Multiplayer Demo",
    description: "Live quiz game demonstrating the jsPsych multiplayer adapter.",
    componentTitle: "Group Quiz",
    componentComments: "Share one link. Presenter clicks 'Host', participants click 'Player'.",
  },
});

// index.html references all assets by flat name already — no path rewrites needed.
const indexHtml = readFileSync(resolve(root, "examples/group-quiz/index.html"), "utf8");
writeFileSync(resolve(assetsDir, "index.html"), indexHtml);
console.log(`  wrote   ${STUDY_DIR_NAME}/index.html`);

// ── Zip ───────────────────────────────────────────────────────────────────────
const zipName = "group-quiz-jatos.jzip";
zipStudy({ distDir, assetsDir, jasFileName, studyDirName: STUDY_DIR_NAME, zipName });

console.log(`\n  Import dist/${zipName} into JATOS.`);
console.log(`  One study link for everyone — presenter clicks Host, participants click Player.`);
