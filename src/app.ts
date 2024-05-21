import { json, urlencoded } from "body-parser";
import cors from "cors";
import { configDotenv } from "dotenv";
import express from "express";
import path from "path";

const app = express();
configDotenv();

import articleRouter from "./controller/article";
import authRouter from "./controller/auth";
import levelRouter from "./controller/level";
import { setupWatcher } from "./services/hotLoader";
import { seedRoles } from "./seed";

// Not secured.. BUT it's a demo and I don't want to deal with CORS issues, since we don't know where
// the frontend will be hosted and else, I will keep it simple... stupid

app.use(cors());
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ limit: "10mb", extended: true }));

export const assetsPath = path.join(process.cwd(), "assets");

app.use("/level", levelRouter);
app.use("/article", articleRouter);
app.use("/assets", express.static(assetsPath));

app.use("/auth", authRouter);

setupWatcher(path.join(process.cwd(), "assets/articles"));

seedRoles()
  .then(() => {
    console.log("Seeds finished with no error");
  })
  .catch((error) => {
    console.error("Failed to seed roles:", error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
