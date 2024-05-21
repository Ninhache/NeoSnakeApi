import express, { Request, Response } from "express";
import { blogFull, blogPostsPreview } from "../services/article";
import { transformTitleToPath } from "../util/BlogUtil";
import { damerauLevenshteinDistance } from "../util/Math";
import { PaginationSchema } from "../schema/filters";
import { ArticleFilterSchema } from "../schema/article";

const articleRouter = express.Router();

articleRouter.get("/", (req: Request, res: Response) => {
  const { page, limit, sortDate, tag, title } = ArticleFilterSchema.merge(
    PaginationSchema
  ).parse(req.query);

  const filteredArticles = blogPostsPreview
    .filter((article) => {
      if (tag.length > 0) {
        return tag.every((tag) => article.tags.includes(tag));
      }
      return true;
    })
    .filter((article) => {
      if (title) {
        return article.title.toLowerCase().includes(title.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortDate === "asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  res.json({
    data: filteredArticles.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      totalItems: filteredArticles.length,
      totalPages: Math.ceil(filteredArticles.length / limit),
    },
  });
});

articleRouter.get("/tags", (req: Request, res: Response) => {
  const tags = blogPostsPreview.reduce((acc, article) => {
    article.tags.forEach((tag) => {
      if (!acc.includes(tag)) {
        acc.push(tag);
      }
    });
    return acc;
  }, [] as string[]);

  res.json(tags);
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
          distance: damerauLevenshteinDistance(
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
