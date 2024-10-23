import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-software-formats";
import "@citation-js/plugin-csl";

import fs from "node:fs";

import { Cite } from "@citation-js/core";
import yaml from "yaml";

export default function generateCitation() {
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

  if (!citationCff) {
    return JSON.stringify({ apa: "", bibtex: "" });
  }

  // Try to convert CITATION.cff to APA string
  const citationApa = (() => {
    try {
      const apaCite = new Cite(citationCff);
      apaCite["data"] = preferredCitation ? apaCite["data"].slice(1) : apaCite["data"];
      return (citationApa = apaCite.format("bibliography", {
        format: "text",
        template: "apa",
        lang: "en-us",
      }));
    } catch (error) {
      console.log(`Error converting CITATION.cff to APA string: ${error.message}`);
      return "";
    }
  })();

  // Try to convert CITATION.cff to bibtex string
  const citationBibtex = (() => {
    try {
      const bibtexCite = new Cite(citationCff);
      bibtexCite["data"] = preferredCitation ? bibtexCite["data"].slice(1) : bibtexCite["data"];
      return (citationBibtex = bibtexCite.format("bibtex", {
        format: "text",
        template: "bibtex",
        lang: "en-us",
      }));
    } catch (error) {
      console.log(`Error converting CITATION.cff to bibtex string: ${error.message}`);
      return null;
    }
  })();

  // Return formatted citation data
  const citationData = {
    apa: citationApa.replace(/\n/g, " "),
    bibtex: citationBibtex.replace(/\n/g, " "),
  };

  return JSON.stringify(citationData);
}

// Execute and write to file
const citationData = generateCitationData();
fs.writeFileSync("citation-data.json", citationData);

console.log("Citation data generated and saved to citation-data.json");
