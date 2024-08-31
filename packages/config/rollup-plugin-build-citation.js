import "@citation-js/plugin-software-formats";

import fs from "node:fs";
import { extname } from "path";

import { Cite } from "@citation-js/core";
import { createFilter } from "@rollup/pluginutils";
import MagicString from "magic-string";

export default function cffToJsonPlugin() {
  const options = { include: ["**/index*"], exclude: [], sourcemap: false };
  let filter = createFilter(options.include, options.exclude);

  const citationCff = fs.readFileSync("./CITATION.cff", "utf-8").toString();
  const citationJson = () => {
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
      this.error(`Error building citation from CITATION.cff: ${error.message}`);
    }
  };

  return {
    name: "rollup-plugin-cff-to-json",
    version: "1.0.0",
    transform: function (code, id) {
      //console.log(typeof id);
      console.log(options.include);
      console.log(id);
      console.log(filter(id));
      if (!filter(id) || (extname(id) !== ".js" && extname(id) !== ".ts")) return;
      console.log("transforming: " + id);
      const magicString = new MagicString(code);
      const targetString = "citation: []";
      const citationString = "citation: " + citationJson();
      const startIndex = code.indexOf(targetString);
      if (startIndex !== -1) {
        magicString.overwrite(startIndex, startIndex + targetString.length, citationString);
      } else {
        this.error(`Error replacing citation string in ${id}`);
      }

      return {
        code: magicString.toString(),
      };
    },
  };
}
