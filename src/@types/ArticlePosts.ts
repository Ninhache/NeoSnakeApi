export type ArticlePreview = {
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

export type ArticlePost = ArticlePreview & {
  content: string;
};
