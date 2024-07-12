import path from "path";

import JsPsychMetadata from "../dist/index.js";
import { processData } from "./data.js";

const metadata = new JsPsychMetadata();

const relativePath = process.argv[2];

if (!relativePath) {
  console.error("Providing the path is a required argument");
  process.exit(1);
}

const directoryPath = path.resolve(process.cwd(), relativePath);

const dataFiles = processData(metadata, directoryPath);

// process the metadata_options file
// var metadata_options;
// if (process.argv[3]) {
//   const metadata_options_path = path.resolve(process.cwd(), process.argv[3]);

//   try {
//     const data = fs.readFileSync(metadata_options_path, "utf8"); // synchronous read
//     console.log("metadata options:", data); // log the raw data
//     metadata_options = JSON.parse(data); // parse the JSON data
//     metadata.updateMetadata(metadata_options);
//   } catch (error) {
//     console.error("Error reading or parsing metadata options:", error);
//   }
// };

// const generateFromData = async () => {
//   try {
//     console.log(`Reading file: ${file}:`);

//   } catch (err) {
//     console.error("Error generating from data file:", data);
//   }

// }
