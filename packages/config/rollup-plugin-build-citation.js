import "@citation-js/plugin-software-formats";

import fs from "node:fs";
import { extname } from "path";

import { Cite } from "@citation-js/core";
import { createFilter } from "@rollup/pluginutils";
import MagicString from "magic-string";

export default function cffToJsonPlugin() {
  const options = { include: ["**/index*"], exclude: [], sourcemap: false };
  let filter = createFilter(options.include, options.exclude);

  return {
    name: "rollup-plugin-cff-to-json",
    version: "1.0.0",
    transform: function (code, id) {
      if (!filter(id) || (extname(id) !== ".js" && extname(id) !== ".ts")) return;
      const magicString = new MagicString(code);
      const targetString = "citation: []";

      // Try to find CITATION.cff file
      const citationCff = (() => {
        try {
          return fs.readFileSync("./CITATION.cff", "utf-8").toString();
        } catch (error) {
          console.log(`Error finding CITATION.cff: ${error.message}`);
          return null;
        }
      })();

      // Try to convert CITATION.cff to JSON
      const citationJson = (() => {
        if (!citationCff) return null;
        try {
          return JSON.stringify(
            Cite(citationCff).format("data", {
              format: "object",
              lang: "en-us",
            }),
            null,
            2
          );
        } catch (error) {
          console.log(`Error converting CITATION.cff to JSON: ${error.message}`);
          return null;
        }
      })();

      // Replace target string with citation JSON
      if (!citationJson) {
        return { code: code };
      }
      const citationString = "citation: " + citationJson;
      const startIndex = code.indexOf(targetString);
      if (startIndex !== -1) {
        magicString.overwrite(startIndex, startIndex + targetString.length, citationString);
        return { code: magicString.toString() };
      } else {
        this.error(`Error replacing citation string in ${id}`);
        return { code: code };
      }
    },
  };
}
