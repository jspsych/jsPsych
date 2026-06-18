#!/usr/bin/env node
// Assembles a JATOS-ready study archive for the multiplayer ultimatum game.
// Copies built dist files into a flat folder and rewrites <script src> paths,
// then zips the result for import into JATOS.
//
// Usage: node scripts/build-jatos-ultimatum.js
// Output: dist/ultimatum-jatos.zip

import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
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

// ── JATOS study metadata ──────────────────────────────────────────────────────
// JATOS requires this at the root of the archive to recognise it as a valid study.
const metadata = {
  version: "3",
  data: {
    uuid: randomUUID(),
    title: "Multiplayer Ultimatum Game",
    description: "Two-player ultimatum game built with jsPsych.",
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
        uuid: randomUUID(),
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
// JATOS 3.x archive structure:
//   ultimatum-jatos.jas   ← study metadata at zip root (must have .jas extension)
//   ultimatum-jatos/      ← study assets folder (must match dirName)
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

let html = readFileSync(resolve(root, "examples/multiplayer-ultimatum-game-sync.html"), "utf8");
for (const [original, replacement] of Object.entries(pathRewrites)) {
  html = html.replaceAll(original, replacement);
}
writeFileSync(resolve(assetsDir, "index.html"), html);
console.log(`  wrote   ${STUDY_DIR_NAME}/index.html`);

// JATOS 3.x import scans for any *.jas file at the zip root — the name is arbitrary.
const JAS_FILE_NAME = `${STUDY_DIR_NAME}.jas`;
writeFileSync(resolve(distDir, JAS_FILE_NAME), JSON.stringify(metadata, null, 2));
console.log(`  wrote   ${JAS_FILE_NAME}`);

// ── Zip ───────────────────────────────────────────────────────────────────────
const zipName = "ultimatum-jatos.jzip";
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
console.log(`\n  Import dist/${zipName} into JATOS via the Import Study button.`);
