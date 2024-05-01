import express, { Request, Response } from "express";
import { BlogPostPreview } from "./@types/BlogPosts";
import cors from "cors";
import { transformTitleToPath } from "./util/BlogUtil";
import { damerDamerauLevenshteinDistance } from "./util/Math";

const app = express();

// Not secured.. BUT it's a demo and I don't want to deal with CORS issues, since we don't know where
// the frontend will be hosted and else, I will keep it simple... stupid
app.use(cors());

// They're book for the moment, but, ahem, it's a demo ?
const articles: BlogPostPreview[] = [
  {
    id: 1,
    title: "The Great Gatsby",
    date: "1925",
    abstract: "A novel by F. Scott Fitzgerald",
    image: "https://picsum.photos/200/300",
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    date: "1960",
    abstract: "A novel by Harper Lee",
    image: "https://picsum.photos/200/300",
  },
  {
    id: 3,
    title: "1984",
    date: "1949",
    abstract: "A novel by George Orwell",
    image: "https://picsum.photos/200/300",
  },
];

app.get("/articles", (_: Request, res: Response) => {
  articles.forEach((article) => {
    article.path = transformTitleToPath(article.title);
  });
  res.json(articles);
});

app.get("/article/:path", (req: Request, res: Response) => {
  const article = articles.find(
    (article) => transformTitleToPath(article.title) === req.params.path
  );

  if (article) {
    res.json(article);
  } else {
    const levensteinArticle = articles
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
