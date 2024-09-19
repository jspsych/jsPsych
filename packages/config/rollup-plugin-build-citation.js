import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-software-formats";
import "@citation-js/plugin-csl";

import fs from "node:fs";
import { extname } from "path";

import { Cite } from "@citation-js/core";
import { createFilter } from "@rollup/pluginutils";
import MagicString from "magic-string";
import yaml from "yaml";

export default function cffToJsonPlugin() {
  const options = { include: ["**/index*"], exclude: [], sourcemap: false };
  let filter = createFilter(options.include, options.exclude);

  return {
    name: "rollup-plugin-cff-to-json",
    version: "1.0.0",
    transform: function (code, id) {
      if (!filter(id) || (extname(id) !== ".js" && extname(id) !== ".ts")) return;
      const magicString = new MagicString(code);
      let preferredCitation = false;

      // Try to find CITATION.cff file and look for preferred-citation
      const citationCff = (() => {
        try {
          const rawCff = fs.readFileSync("./CITATION.cff", "utf-8").toString();
          const cffData = yaml.parse(rawCff);
          if (cffData["preferred-citation"]) {
            console.log("Found 'preferred-citation' in CITATION.cff");
            preferredCitation = true;
          } else {
            console.log("No 'preferred-citation' found in CITATION.cff");
          }
          return yaml.stringify(rawCff);
        } catch (error) {
          console.log(`Error finding CITATION.cff: ${error.message}`);
          return null;
        }
      })();

      // Try to convert CITATION.cff to APA string
      const citationApa = (() => {
        try {
          const apaCite = new Cite(citationCff);
          apaCite["data"] = preferredCitation ? apaCite["data"].slice(1) : apaCite["data"];
          const citationApa = apaCite.format("bibliography", {
            format: "text",
            template: "apa",
            lang: "en-us",
          });
          return citationApa;
        } catch (error) {
          console.log(`Error converting CITATION.cff to APA string: ${error.message}`);
          return null;
        }
      })();

      // Try to convert CITATION.cff to bibtex string
      const citationBibtex = (() => {
        try {
          const bibtexCite = new Cite(citationCff);
          bibtexCite["data"] = preferredCitation ? bibtexCite["data"].slice(1) : bibtexCite["data"];
          const citationBibtex = bibtexCite.format("bibtex", {
            format: "text",
            template: "bibtex",
            lang: "en-us",
          });
          return citationBibtex;
        } catch (error) {
          console.log(`Error converting CITATION.cff to bibtex string: ${error.message}`);
          return null;
        }
      })();

      // Replace target string with citation APA and bibtex strings
      if (!citationApa && !citationBibtex) {
        return { code: code };
      }
      //console.log(`citation: {\napa: "${citationApa.replace(/\n/g, ' ')}", \nbibtex: "${citationBibtex.replace(/\n/g, ' ')}"\n}`);
      const citationString = `citation:\n { apa: "${citationApa.replace(
        /\n/g,
        " "
      )}",\n bibtex: "${citationBibtex.replace(/\n/g, " ")}"\n }`;
      console.log(citationString);
      const targetString = "citation: []";
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
