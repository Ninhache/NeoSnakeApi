import fs from "fs";
import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import { transformTitleToPath } from "./util/BlogUtil";
import { damerDamerauLevenshteinDistance } from "./util/Math";
import { BlogPost, BlogPostPreview } from "./@types/BlogPosts";
import { metadataParser } from "./util/MetadataParser";

const app = express();

// Not secured.. BUT it's a demo and I don't want to deal with CORS issues, since we don't know where
// the frontend will be hosted and else, I will keep it simple... stupid
app.use(cors());

const assetsPath = path.join(__dirname, "assets");

const articlesPreview: BlogPostPreview[] = [];
const articlesFull: BlogPost[] = [];

async function readMarkdownFiles(directory: string): Promise<void> {
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
readMarkdownFiles(path.join(__dirname, "articles"));

app.get("/articles", (_: Request, res: Response) => {
  res.json(articlesPreview);
});

app.get("/article/:path", (req: Request, res: Response) => {
  const article = articlesFull.find(
    (article) => transformTitleToPath(article.title) === req.params.path
  );

  if (article) {
    res.json(article);
  } else {
    const levensteinArticle = articlesFull
      .map((article) => {
        return {
          article,
          distance: damerDamerauLevenshteinDistance(
            transformTitleToPath(article.title),
            req.params.path
          ),
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .find((article) => article);

    res.status(404).json(levensteinArticle?.article);
  }
});

app.use("/assets", express.static(assetsPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
