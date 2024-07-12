// import JsPsychMetadata from "../dist/index.js";
import fs from "fs";
import path from "path";

// Loading the data for generating metadata
export const processData = async (metadata, directoryPath) => {
  const dataFiles = [];

  try {
    const files = await fs.promises.readdir(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      try {
        const data = await fs.promises.readFile(filePath, "utf8");
        dataFiles.push(data);
        await metadata.generate(data);
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }

  console.log(metadata.getMetadata());

  return dataFiles;
};
