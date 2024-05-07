import cors from "cors";
import express from "express";
import path from "path";
import { configDotenv } from "dotenv";

const app = express();
configDotenv();

import articleRouter from "./routes/article";
import levelRouter from "./routes/level";
import { setupWatcher } from "./services/hotLoader";

// Not secured.. BUT it's a demo and I don't want to deal with CORS issues, since we don't know where
// the frontend will be hosted and else, I will keep it simple... stupid
app.use(cors());
app.use(express.json());

export const assetsPath = path.join(process.cwd(), "assets");

app.use("/level", levelRouter);
app.use("/article", articleRouter);
app.use("/assets", express.static(assetsPath));

setupWatcher(path.join(process.cwd(), "assets/articles"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
