import { readFileSync } from "fs";
import { sep as pathSeparator } from "path";

import glob from "glob";
import gulp from "gulp";
import file from "gulp-file";
import rename from "gulp-rename";
import replace from "gulp-replace";
import zip from "gulp-zip";
import merge from "merge-stream";

const { dest, src } = gulp;

const readJsonFile = (filename) => JSON.parse(readFileSync(filename, "utf8"));

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
          })

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

export const createCoreDistArchive = () =>
  merge(
    // index.browser.js files
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
      .pipe(replace(/\/\/# sourceMappingURL=.*\n/g, "")),

    // jspsych.css
    src("packages/jspsych/css/jspsych.css").pipe(rename("/dist/jspsych.css")),

    // Examples
    src("examples/**/*", { base: "." })
      // Rewrite script source paths
      .pipe(
        replace(
          /<script src="(.*)\/packages\/(.*)\/dist\/index\.browser\.js"><\/script>/g,
          '<script src="$1/dist/$2.js"></script>'
        )
      )
      // Rewrite jspsych css source paths
      .pipe(
        replace(
          /<link rel="stylesheet" href="(.*)\/packages\/jspsych\/css\/(.*)" \/>/g,
          '<link rel="stylesheet" href="$1/dist/$2" />'
        )
      ),

    // VERSION.md
    file("VERSION.md", getVersionFileContents(), { src: true }),

    // Other files
    src(["*.md", "license.txt"])
  )
    .pipe(zip("dist.zip"))
    .pipe(dest("."));
