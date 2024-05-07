import { promises as fsPromises } from "fs";
import path from "path";

import { assetsPath } from "../app";

export async function getLevels(): Promise<string[]> {
  try {
    const files = await fsPromises.readdir(`${assetsPath}/level/local`);
    const levelsId = files
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .map((file) => file.split(".")[0].split("_")[1]);

    return levelsId;
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
}

export async function getLevel(id: number): Promise<object> {
  try {
    const data = await fsPromises.readFile(
      `${assetsPath}/level/local/level_${id}.json`,
      "utf-8"
    );
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    throw err;
  }
}
