import express, { Request, Response } from "express";
import { getLevel, getLevels } from "../services/level";
import { SnakeMapData, snakeMapDataSchema } from "../@types/SnakeMap";
import { z } from "zod";
import path from "path";
import fs from "fs";

const levelRouter = express.Router();

levelRouter.get("/", (_: Request, res: Response) => {
  getLevels().then((levels) => {
    res.json(levels);
  });
});

levelRouter.post("/upload", (req: Request, res: Response) => {
  try {
    const data: unknown = req.body;
    const snakeMapData: SnakeMapData = snakeMapDataSchema.parse(data);

    res.status(200).send("JSON parsed successfully");

    const storagePath = path.join(
      __dirname,
      "../assets/level/online",
      `${snakeMapData.id}.json`
    );

    fs.writeFile(storagePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("File written successfully");
      }
    });
  } catch (error) {
    res.status(400).send("Invalid JSON");
  }
});

levelRouter.get("/:id", (req: Request, res: Response) => {
  getLevel(parseInt(req.params.id))
    .then((level) => {
      res.json(level);
    })
    .catch((_) => {
      res.status(404);
      res.json({ error: "Level not found" });
    });
});

export default levelRouter;
