import cors from "cors";
import express from "express";
import path from "path";

const app = express();

import levelRouter from "./routes/level";
import { setupWatcher } from "./services/hotLoader";
import articleRouter from "./routes/article";

// Not secured.. BUT it's a demo and I don't want to deal with CORS issues, since we don't know where
// the frontend will be hosted and else, I will keep it simple... stupid
app.use(cors());
app.use(express.json());

export const assetsPath = path.join(__dirname, "assets");

app.use("/level", levelRouter);
app.use("/article", articleRouter);
app.use("/assets", express.static(assetsPath));

setupWatcher(path.join(__dirname, "articles"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
