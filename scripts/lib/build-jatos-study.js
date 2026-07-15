// Shared helpers for assembling a JATOS-ready study archive (.jzip):
// copy flat assets into a study folder, write JATOS study metadata (.jas),
// and zip both into an importable archive.
//
// Used by build-jatos-group-quiz.js and build-jatos-ultimatum.js.

import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * @param {object} opts
 * @param {string} opts.root - repo root (resolve assets/dist paths relative to this)
 * @param {string} opts.studyDirName - folder name inside the archive (must match metadata.dirName)
 * @param {Array<{src: string, dest: string}>} opts.assets - files to copy into the study folder, relative to root
 * @param {object} opts.studyMeta - { title, description, componentTitle, componentComments, batch }
 * @returns {{ distDir: string, assetsDir: string }}
 */
export function buildAssetsAndMetadata({ root, studyDirName, assets, studyMeta }) {
  const distDir = resolve(root, "dist");
  const assetsDir = resolve(distDir, studyDirName);

  rmSync(assetsDir, { recursive: true, force: true });
  mkdirSync(assetsDir, { recursive: true });

  for (const { src, dest } of assets) {
    cpSync(resolve(root, src), resolve(assetsDir, dest));
    console.log(`  copied  ${src} → ${studyDirName}/${dest}`);
  }

  const metadata = {
    version: "3",
    data: {
      uuid: randomUUID(),
      title: studyMeta.title,
      description: studyMeta.description,
      groupStudy: true,
      linearStudy: false,
      allowPreview: false,
      dirName: studyDirName,
      comments: "",
      jsonData: null,
      endRedirectUrl: null,
      studyEntryMsg: null,
      componentList: [
        {
          uuid: randomUUID(),
          title: studyMeta.componentTitle,
          htmlFilePath: "index.html",
          reloadable: false,
          active: true,
          comments: studyMeta.componentComments ?? "",
          jsonData: null,
        },
      ],
      batchList: [
        {
          uuid: randomUUID(),
          title: "Default",
          active: true,
          maxActiveMembers: studyMeta.batch?.maxActiveMembers ?? null,
          maxTotalMembers: studyMeta.batch?.maxTotalMembers ?? null,
          maxTotalWorkers: null,
          allowedWorkerTypes: ["Jatos", "GeneralSingle", "GeneralMultiple"],
          comments: null,
          jsonData: null,
        },
      ],
    },
  };

  const jasFileName = `${studyDirName}.jas`;
  writeFileSync(resolve(assetsDir, "..", jasFileName), JSON.stringify(metadata, null, 2));
  console.log(`  wrote   ${jasFileName}`);

  return { distDir, assetsDir, jasFileName };
}

/**
 * Zips the study metadata + assets folder into a .jzip archive.
 * On Windows, uses .NET's ZipFile API directly (via a throwaway PowerShell script)
 * since Compress-Archive emits backslash entry names, which violates the ZIP spec.
 */
export function zipStudy({ distDir, assetsDir, jasFileName, studyDirName, zipName }) {
  const zipPath = resolve(distDir, zipName);
  rmSync(zipPath, { force: true });

  if (process.platform === "win32") {
    const metadataPath = resolve(distDir, jasFileName);
    const psLines = [
      "Add-Type -AssemblyName System.IO.Compression.FileSystem",
      `$zip = [System.IO.Compression.ZipFile]::Open("${zipPath}", 'Create')`,
      "$comp = [System.IO.Compression.CompressionLevel]::Optimal",
      `[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "${metadataPath}", '${jasFileName}', $comp)`,
      `Get-ChildItem -Path "${assetsDir}" -File | ForEach-Object {`,
      `  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, '${studyDirName}/' + $_.Name, $comp)`,
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
    execSync(`cd "${distDir}" && zip -r ${zipName} ${jasFileName} ${studyDirName}/`);
  }

  console.log(`\n  zipped  dist/${zipName}`);
}
