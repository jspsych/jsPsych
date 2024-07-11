import fs from "fs";
import path from "path";

import JsPsychMetadata from "../dist/index.js";

const metadata = new JsPsychMetadata();
// console.log("arg 0", process.argv[0]);
// console.log("arg 1", process.argv[1]);
// console.log("arg 2", process.argv[2], "typeof", typeof process.argv[2]);

const relativePath = process.argv[2] || "../../../backend/mockdata/"; // process.argv[2] |
const directoryPath = path.resolve(process.cwd(), relativePath);

var metadata_options;

if (process.argv[3]) {
  const metadata_options_path = path.resolve(process.cwd(), process.argv[3]);

  try {
    const data = fs.readFileSync(metadata_options_path, "utf8"); // synchronous read
    console.log("metadata options:", data); // log the raw data
    metadata_options = JSON.parse(data); // parse the JSON data
  } catch (error) {
    console.error("Error reading or parsing metadata options:", error);
  }
}

const processData = async () => {
  try {
    const files = await fs.promises.readdir(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      try {
        const data = await fs.promises.readFile(filePath, "utf8");

        console.log(`Reading file: ${file}:`);

        await metadata.generate(data, metadata_options);
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }

  await console.log(metadata.getMetadata());
};

// Call the processFiles function
processData();
