#!/usr/bin/env node
// Assembles a JATOS-ready study archive for the Kahoot demo.
// Produces dist/kahoot-jatos.jzip with one component (index.html) that
// contains a landing page where participants self-select Host or Player.
//
// Usage: node scripts/build-jatos-kahoot.js
//
// NOTE: This script copies pre-built dist files from packages/. If you changed
// any package source since the last build, run `npm run build` first or the
// jzip will contain stale output.

import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STUDY_DIR_NAME = "kahoot-jatos";

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
  { src: "examples/kahoot/protocol.js", dest: "protocol.js" },
  { src: "examples/kahoot/questions.js", dest: "questions.js" },
];

// ── JATOS study metadata ──────────────────────────────────────────────────────
const metadata = {
  version: "3",
  data: {
    uuid: randomUUID(),
    title: "Kahoot Multiplayer Demo",
    description: "Live quiz game demonstrating the jsPsych multiplayer adapter.",
    groupStudy: true,
    linearStudy: false,
    allowPreview: false,
    dirName: STUDY_DIR_NAME,
    comments: "",
    jsonData: null,
    endRedirectUrl: null,
    studyEntryMsg: null,
    componentList: [
      {
        uuid: randomUUID(),
        title: "Kahoot",
        htmlFilePath: "index.html",
        reloadable: false,
        active: true,
        comments: "Share one link. Presenter clicks 'Host', participants click 'Player'.",
        jsonData: null,
      },
    ],
    batchList: [
      {
        uuid: randomUUID(),
        title: "Default",
        active: true,
        maxActiveMembers: null,
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
const distDir = resolve(root, "dist");
const assetsDir = resolve(distDir, STUDY_DIR_NAME);

rmSync(assetsDir, { recursive: true, force: true });
mkdirSync(assetsDir, { recursive: true });

for (const { src, dest } of assets) {
  cpSync(resolve(root, src), resolve(assetsDir, dest));
  console.log(`  copied  ${src} → ${STUDY_DIR_NAME}/${dest}`);
}

// index.html references all assets by flat name already — no path rewrites needed.
const indexHtml = readFileSync(resolve(root, "examples/kahoot/index.html"), "utf8");
writeFileSync(resolve(assetsDir, "index.html"), indexHtml);
console.log(`  wrote   ${STUDY_DIR_NAME}/index.html`);

const JAS_FILE_NAME = `${STUDY_DIR_NAME}.jas`;
writeFileSync(resolve(distDir, JAS_FILE_NAME), JSON.stringify(metadata, null, 2));
console.log(`  wrote   ${JAS_FILE_NAME}`);

// ── Zip ───────────────────────────────────────────────────────────────────────
const zipName = "kahoot-jatos.jzip";
const zipPath = resolve(distDir, zipName);
rmSync(zipPath, { force: true });
if (process.platform === "win32") {
  // Compress-Archive uses backslash entry names, violating the ZIP spec.
  // Use .NET's ZipFile API directly so we can force forward-slash entry names.
  const metadataPath = resolve(distDir, JAS_FILE_NAME);
  const psLines = [
    "Add-Type -AssemblyName System.IO.Compression.FileSystem",
    `$zip = [System.IO.Compression.ZipFile]::Open("${zipPath}", 'Create')`,
    "$comp = [System.IO.Compression.CompressionLevel]::Optimal",
    `[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "${metadataPath}", '${JAS_FILE_NAME}', $comp)`,
    `Get-ChildItem -Path "${assetsDir}" -File | ForEach-Object {`,
    `  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, '${STUDY_DIR_NAME}/' + $_.Name, $comp)`,
    "}",
    "$zip.Dispose()",
  ];
  const tmpScript = resolve(distDir, "_build_zip.ps1");
  writeFileSync(tmpScript, psLines.join("\n"), "utf8");
  try {
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tmpScript}"`);
  } finally {
    rmSync(tmpScript, { force: true });
  }
} else {
  execSync(`cd "${distDir}" && zip -r ${zipName} ${JAS_FILE_NAME} ${STUDY_DIR_NAME}/`);
}
console.log(`\n  zipped  dist/${zipName}`);
console.log(`\n  Import dist/${zipName} into JATOS.`);
console.log(`  One study link for everyone — presenter clicks Host, participants click Player.`);
