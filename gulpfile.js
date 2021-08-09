import gulp from "gulp";
import rename from "gulp-rename";
import replace from "gulp-replace";
import zip from "gulp-zip";
import merge from "merge-stream";

const { dest, src } = gulp;

export const createDistArchive = () =>
  merge(
    // index.browser.js files
    src("packages/*/dist/index.browser.js", { root: "packages/" })
      // Rename dist files
      .pipe(
        rename((path) => {
          const packageName = path.dirname.split("/")[0];

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

    // Other files
    src(["*.md", "license.txt"])
  )
    .pipe(zip("dist.zip"))
    .pipe(dest("."));
