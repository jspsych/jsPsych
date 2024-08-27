const fs = require("node:fs");
const path = require("path");
require("@citation-js/plugin-software-formats");
const { Cite } = require("@citation-js/core");

function cffToJsonPlugin(options = {}) {
  return {
    name: "rollup-plugin-cff-to-json",
    version: "1.0.0",

    generateBundle() {
      const srcDir = options.srcDir || __dirname;
      const indexFilePath = path.join(srcDir, "index.js"); // Assume index.js is in src

      const updateCitations = (indexFilePath, citationJson) => {
        let fileContent = fs.readFileSync(indexFilePath, "utf-8");
        fileContent = fileContent.replace(/`{citationJson}`/g, citationJson);
        fs.writeFileSync(indexFilePath, fileContent, "utf-8");
      };

      const templateDir = path.dirname(srcDir);
      const cffFilePath = path.join(templateDir, "CITATION.cff"); // Assume CITATION.cff is top level

      try {
        let cffCitation = fs.readFileSync(cffFilePath, "utf-8").toString();
        Cite.async(cffCitation).then((data) => {
          const citationJson = JSON.stringify(
            data.format("data", {
              format: "object",
              lang: "en-US",
            }),
            null,
            2
          );
          updateCitations(indexFilePath, citationJson);
        });
      } catch (error) {
        this.error(`Error building citation from CITATION.cff: ${error.message}`);
      }
    },
  };
}

module.exports = cffToJsonPlugin;
