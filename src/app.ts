import express, { Request, Response } from "express";
import { BlogPostPreview } from "./@types/BlogPosts";
import cors from "cors";

const app = express();

// Not secured.. BUT it's a demo and I don't want to deal with CORS issues, since we don't know where
// the frontend will be hosted and else, I will keep it simple... stupid
app.use(cors());

// They're book for the moment, but, ahem, it's a demo ?
const posts: BlogPostPreview[] = [
  {
    id: 1,
    title: "The Great Gatsby",
    path: "gatsby",
    date: "1925",
    abstract: "A novel by F. Scott Fitzgerald",
    image: "https://picsum.photos/200/300",
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    path: "mockingbird",
    date: "1960",
    abstract: "A novel by Harper Lee",
    image: "https://picsum.photos/200/300",
  },
  {
    id: 3,
    title: "1984",
    path: "1984",
    date: "1949",
    abstract: "A novel by George Orwell",
    image: "https://picsum.photos/200/300",
  },
];

app.get("/posts", (_: Request, res: Response) => {
  res.json(posts);
});

app.get("/post/:id", (req: Request, res: Response) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (post) {
    res.json(post);
  } else {
    res.status(404).send("Post not found");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
