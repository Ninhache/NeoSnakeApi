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
import { instance } from "./db/init";
import { getAllCampaign, seedRoles } from "./seed";
import { setupWatcher } from "./services/hotLoader";

// Not secured.. BUT it's a demo and I don't want to deal with CORS issues, since we don't know where
// the frontend will be hosted and else, I will keep it simple... stupid

app.use(cors());
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ limit: "10mb", extended: true }));

export const assetsPath = path.join(process.cwd(), "assets");

// app.use("*", (req, res, next) => {
//   console.log(
//     `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`
//   );
//   next();
// });

app.use("/level", levelRouter);
app.use("/article", articleRouter);
app.use("/assets", express.static(assetsPath));

app.use("/auth", authRouter);

setupWatcher(path.join(process.cwd(), "assets/articles"));

instance.authenticate().then(() => {
  console.log("DB Connection has been established successfully.");
  console.log("Try seeding in 5 seconds !");
  setTimeout(() => {
    seedRoles();
  }, 5000);
  setTimeout(() => {
    getAllCampaign();
  }, 5000);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
