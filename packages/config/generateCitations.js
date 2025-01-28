import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-software-formats";
import "@citation-js/plugin-csl";

import fs from "node:fs";
import path from "node:path";

import { Cite } from "@citation-js/core";
import appRootPath from "app-root-path";

/**
 * Generate citation data from CITATION.cff file
 * Currently supported formats: APA, BibTeX
 *
 * @returns {Object} - Object containing APA and BibTeX formatted citation data
 */
export default function generateCitations() {
  let preferredCitation = false;

  // Try to find CITATION.cff file and look for preferred-citation
  const citationCff = (() => {
    let rawCff;
    const getCff = (path) => {
      rawCff = fs.readFileSync(path, "utf-8").toString();
      preferredCitation = rawCff.includes("preferred-citation:");
      return rawCff;
    };

    try {
      // look for CITATION.cff in the current directory
      return getCff("./CITATION.cff");
    } catch (error) {
      try {
        // look for CITATION.cff in the root of the repository
        return getCff(path.join(appRootPath.path, "CITATION.cff"));
      } catch (error) {
        console.warn(
          `No CITATION.cff file found: ${error.message}. If you would like to include a citation, please create a CITATION.cff file in the root of your repository.`
        );
        return null;
      }
    }
  })();

  if (!citationCff) {
    return { apa: "", bibtex: "" };
  }

  // Convert CITATION.cff to APA string
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
      return "";
    }
  })();

  // Convert CITATION.cff to BibTeX string
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
      console.log(`Error converting CITATION.cff to BibTeX string: ${error.message}`);
      return "";
    }
  })();

  // Return formatted citation data
  const citationData = {
    apa: citationApa.replace(/\n/g, " "),
    bibtex: citationBibtex.replace(/\n/g, " "),
  };

  return citationData;
}
