import { readFileSync } from "fs";
import { sep as pathSeparator } from "path";
import { Readable } from "stream";

import glob from "glob";
import gulp from "gulp";
import file from "gulp-file";
import rename from "gulp-rename";
import replace from "gulp-replace";
import zip from "gulp-zip";

const { dest, src } = gulp;

// Drains a Vinyl object stream and resolves with the emitted files. We collect
// every substream up front instead of feeding `gulp-zip` through `merge-stream`
// because under gulp 5 (streamx-based Vinyl) the zip sink can finalize before
// slow upstreams flush, silently dropping files from `dist.zip`.
const collectFiles = (stream) =>
  new Promise((resolve, reject) => {
    const files = [];
    stream.on("data", (vinylFile) => files.push(vinylFile));
    stream.on("end", () => resolve(files));
    stream.on("error", reject);
  });

const readJsonFile = (filename) => JSON.parse(readFileSync(filename, "utf8"));

const getAllPackages = () =>
  glob
    // Get an array of all package.json filenames
    .sync("packages/*/package.json")

    // Map file names to package details
    .map((filename) => {
      const packageJson = readJsonFile(filename);
      return {
        name: packageJson.name,
        version: packageJson.version,
      };
    });

const getVersionFileContents = () =>
  [
    "Included in this release:\n",
    "Package|Version|Documentation",
    "--- | --- | ---",
    ...(() => {
      const docsBaseUrl =
        "https://www.jspsych.org/" +
        readJsonFile("packages/jspsych/package.json").version.split(".").slice(0, -1).join(".") +
        "/";

      return (
        getAllPackages()
          // Filter packages that should not be listed
          .filter(({ name }) => !["@jspsych/config", "@jspsych/test-utils"].includes(name))

          // Move the core package to the top of the list
          .sort(({ name: n1 }, { name: n2 }) => (n1 === "jspsych" ? -1 : n2 === "jspsych" ? 1 : 0))

          // Map package details to MarkDown table row strings
          .map(({ name, version }) => {
            return `${name.replace("@jspsych/", "")}|${version}|${
              name === "jspsych"
                ? docsBaseUrl
                : name.startsWith("@jspsych/plugin-")
                ? docsBaseUrl + "plugins/" + name.replace("@jspsych/plugin-", "")
                : name.startsWith("@jspsych/extension-")
                ? docsBaseUrl + "extensions/" + name.replace("@jspsych/extension-", "")
                : ""
            }`;
          })
      );
    })(),
    "",
  ].join("\n");

export const createCoreDistArchive = async () => {
  const fileGroups = await Promise.all([
    // index.browser.js files
    collectFiles(
      src("packages/*/dist/index.browser.js", { root: "packages/" })
        // Rename dist files
        .pipe(
          rename((path) => {
            const packageName = path.dirname.split(pathSeparator)[0];

            path.dirname = "/dist";
            path.basename = packageName;
          })
        )
        // Remove sourceMappingURL comments
        .pipe(replace(/\/\/# sourceMappingURL=.*\n/g, ""))
    ),

    // jspsych.css
    collectFiles(src("packages/jspsych/css/jspsych.css").pipe(rename("/dist/jspsych.css"))),

    // survey.css
    collectFiles(src("packages/plugin-survey/css/survey.css").pipe(rename("/dist/survey.css"))),
    collectFiles(
      src("packages/plugin-survey/css/survey.min.css").pipe(rename("/dist/survey.min.css"))
    ),

    // Examples HTML files
    collectFiles(
      src(["examples/**/*.html"], { base: "." })
        // Rewrite script source paths
        .pipe(
          replace(
            /<script src="(.*)\/packages\/(.*)\/dist\/index\.browser\.js"/g,
            '<script src="$1/dist/$2.js"'
          )
        )
        // Rewrite jspsych css source paths
        .pipe(
          replace(
            /<link rel="stylesheet" href="(.*)\/packages\/jspsych\/css\/(.*)"/g,
            '<link rel="stylesheet" href="$1/dist/$2"'
          )
        )
    ),

    // Examples files other than HTML (e.g. media files)
    // Note: `encoding: false` means that the files contents are treated as binary.
    // This prevents Gulp from corrupting binary files such as images when it reads them.
    // Needed since Gulp v5.
    collectFiles(src(["examples/**/*", "!examples/**/*.html"], { base: ".", encoding: false })),

    // VERSION.md
    collectFiles(file("VERSION.md", getVersionFileContents(), { src: true })),

    // Other files
    collectFiles(src(["*.md", "license.txt"])),
  ]);

  // Await the destination's `finish` so gulp doesn't mark this task complete
  // before `dist.zip` is fully written (async-done resolves a returned Promise
  // by its resolved value, not by re-handling a stream the Promise resolves to).
  const writeStream = Readable.from(fileGroups.flat()).pipe(zip("dist.zip")).pipe(dest("."));
  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("end", resolve);
    writeStream.on("error", reject);
  });
};

/**
 * Updates each unpkg link with a precise version number to the corresponding package's current
 * version as defined in the package's `package.json`. Only considers `.md` and `.html` files.
 */
export const updateUnpkgLinks = () => {
  const packageVersions = new Map(getAllPackages().map(({ name, version }) => [name, version]));

  return src(["./**/*.{md,html}"])
    .pipe(
      replace(
        /"https:\/\/unpkg\.com\/(@?.*)@(\d+.\d+.\d+)(\/[^"]*)?"/g,
        (url, packageName, currentVersion, path) => {
          const latestVersion = packageVersions.get(packageName) ?? currentVersion;
          return `"https://unpkg.com/${packageName}@${latestVersion}${path ?? ""}"`;
        }
      )
    )
    .pipe(dest("./"));
};

/**
 * Substitutes the string "current-plugin-version" or version number that follows the text "Current version: "
 * in the plugin docs pages with the package's current version, as defined in the package's `package.json`.
 * Only considers `.md` files in `docs/plugins` folder.
 * Gets the package name from the docs page title (i.e. following "# "), ignoring the string " plugin" in the title.
 */
export const updatePluginVersions = () => {
  const packageVersions = new Map(getAllPackages().map(({ name, version }) => [name, version]));

  return src(["docs/plugins/*.md"])
    .pipe(
      replace(
        /\# (.+?)(?: plugin)?[\s]*?[\n]*Current version: (\d+.\d+.\d+|current-plugin-version)\./gi,
        (match_str, packageName, currentVersionText) => {
          const fullPackageName = "@jspsych/plugin-" + packageName;
          const latestVersion = packageVersions.get(fullPackageName) ?? currentVersionText;
          return `# ${packageName}\n\nCurrent version: ${latestVersion}.`;
        }
      )
    )
    .pipe(dest("./docs/plugins"));
};
