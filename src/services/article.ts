import fs from "fs";
import path from "path";
import { BlogPost, BlogPostPreview } from "../@types/BlogPosts";
import { transformTitleToPath } from "../util/BlogUtil";
import { metadataParser } from "../util/MetadataParser";

export const blogPostsPreview: BlogPostPreview[] = [];
export const blogFull: BlogPost[] = [];

let id = 0;
export async function processMarkdownFile(filePath: string) {
  try {
    const fileName = path.basename(filePath);
    if (
      path.extname(fileName).toLowerCase() !== ".md" ||
      fileName.startsWith("_")
    ) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const { content: parsedContent, metadata } = await metadataParser(content);

    const blog: BlogPost = {
      id: id++,
      title: metadata.title,
      abstract: metadata.abstract,
      path: transformTitleToPath(metadata.title),
      date: metadata.date,
      image: metadata.image,
      tags: metadata.tags,
      authorName: metadata.authorName,
      authorImage: metadata.authorImage,
      readTime: metadata.readTime,
      content: parsedContent,
    };

    updateOrAddBlogPost(blog, filePath);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

export function updateOrAddBlogPost(blog: BlogPost, filePath: string) {
  if (path.basename(filePath).startsWith("_")) {
    return;
  }

  if (path.extname(filePath).toLowerCase() !== ".md") {
    return;
  }

  const existingBlog = blogPostsPreview.find(
    (_blog) => _blog.path === transformTitleToPath(blog.title)
  );

  if (existingBlog !== undefined) {
    // Update existing article
    removeArticle(filePath);
  }

  const {
    title,
    abstract,
    date,
    image,
    tags,
    authorName,
    authorImage,
    readTime,
  } = blog;

  blogPostsPreview.push({
    id: blogPostsPreview.length,
    title,
    abstract,
    path: transformTitleToPath(title),
    date,
    image,
    tags,
    authorName,
    authorImage,
    readTime,
  });

  blogFull.push(blog);

  blogPostsPreview.sort(
    (a: BlogPostPreview, b: BlogPostPreview) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function removeArticle(filePath: string) {
  const fileName = path.basename(filePath);
  if (
    path.extname(fileName).toLowerCase() !== ".md" ||
    fileName.startsWith("_")
  ) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const { metadata } = await metadataParser(content);

  const blog = blogPostsPreview.find(
    (_blog) => _blog.path === transformTitleToPath(metadata.title)
  );

  if (blog !== undefined) {
    const index = blogPostsPreview.indexOf(blog);
    blogPostsPreview.splice(index, 1);
  }

  blogPostsPreview.sort(
    (a: BlogPostPreview, b: BlogPostPreview) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
