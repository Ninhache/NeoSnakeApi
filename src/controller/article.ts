import express, { Request, Response } from "express";
import { transformTitleToPath } from "../util/BlogUtil";
import { blogFull, blogPostsPreview } from "../services/article";
import { damerDamerauLevenshteinDistance } from "../util/Math";
import { BlogPostPreview } from "../@types/BlogPosts";

const articleRouter = express.Router();

articleRouter.get("/", (_: Request, res: Response) => {
  res.json(blogPostsPreview);
});

articleRouter.get("/:path", (req: Request, res: Response) => {
  const article = blogFull.find(
    (article) => transformTitleToPath(article.title) === req.params.path
  );

  if (article) {
    res.json(article);
  } else {
    const levensteinArticle = blogFull
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

export default articleRouter;
