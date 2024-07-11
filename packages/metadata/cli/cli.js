import fs from "fs";
import path from "path";

import JsPsychMetadata from "../dist/index.js";

const metadata = new JsPsychMetadata();
const directoryPath = process.cwd() + "/test"; // can make this the path that is given (relative)
console.log(directoryPath);

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);

    // Read each file asynchronously
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }
      console.log(`Contents of ${file}:`);
      console.log(data); // Output the contents of the file
    });
  });
});

// console.log("metadata:", metadata.getMetadata());
