import { z } from "zod";

export const ArticleFilterSchema = z.object({
  tag: z
    .preprocess((tag) => {
      if (typeof tag === "string") {
        return tag.split(",").filter(Boolean);
      }
      return [];
    }, z.array(z.string()))
    .default([]),
  sortDate: z.enum(["asc", "desc"]).default("desc"),
  title: z.string().min(3).optional(),
});

export type BlogPostPreview = {
  id: number;
  title: string;
  path?: string;
  date: string;
  abstract: string;
  image: string;
  authorName: string;
  authorImage: string;
  tags: string[];
  readTime: number;
};

export type BlogPost = BlogPostPreview & {
  content: string;
};
