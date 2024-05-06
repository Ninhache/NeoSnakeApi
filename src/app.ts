import cors from "cors";
import express, { Request, Response } from "express";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import { BlogPost, BlogPostPreview } from "./@types/BlogPosts";
import { transformTitleToPath } from "./util/BlogUtil";
import { metadataParser } from "./util/MetadataParser";

const app = express();

// Not secured.. BUT it's a demo and I don't want to deal with CORS issues, since we don't know where
// the frontend will be hosted and else, I will keep it simple... stupid
app.use(cors());

const assetsPath = path.join(__dirname, "assets");

const articlesPreview: BlogPostPreview[] = [];
const articlesFull: BlogPost[] = [];

async function loadMarkdownFiles(directory: string): Promise<void> {
  try {
    const files = fs.readdirSync(directory);

    const markdownFiles = files
      .filter((file) => path.extname(file).toLowerCase() === ".md")
      .filter((file) => !file.startsWith("_"));

    let id = 0;
    for (const file of markdownFiles) {
      const filePath = path.join(directory, file);
      const nonParsedContent = fs.readFileSync(filePath, "utf-8");

      const { content, metadata } = await metadataParser(nonParsedContent);

      articlesPreview.push({
        id: id++,
        title: metadata.title,
        abstract: metadata.abstract,
        path: transformTitleToPath(metadata.title),
        date: metadata.date,
        image: metadata.image,
        tags: metadata.tags,
        authorname: metadata.authorname,
        authorimage: metadata.authorimage,
      });

      articlesFull.push({
        content: content,
        id: id,
        title: metadata.title,
        date: metadata.date,
        image: metadata.image,
        tags: metadata.tags,
        abstract: metadata.abstract,
        authorname: metadata.authorname,
        authorimage: metadata.authorimage,
      });
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }
}

async function getLevels(): Promise<string[]> {
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

async function getLevel(id: number): Promise<object> {
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

app.get("/articles", (_: Request, res: Response) => {
  res.json(articlesPreview);
});

app.get("/levels", (_: Request, res: Response) => {
  getLevels().then((levels) => {
    res.json(levels);
  });
});

app.get("/level/:id", (req: Request, res: Response) => {
  getLevel(parseInt(req.params.id))
    .then((level) => {
      res.json(level);
    })
    .catch((_) => {
      res.status(404);
      res.json({ error: "Level not found" });
    });
});

app.use("/assets", express.static(assetsPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
