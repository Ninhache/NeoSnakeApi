import { z } from "zod";
import {
  scenarioDataOptionsSchema,
  scenarioFruitsSchema,
  scenarioObstaclesSchema,
} from "./map";
export const OnlineMapCompletionSchema = z.object({
  user_id: z.number(),
  map_id: z.string(),
  completionTime: z.number(),
  completionDate: z.number(),
});

export const PreviewOnlineSchema = z.object({
  id: z.string(),
  preview: z.object({
    fruits: z.array(scenarioFruitsSchema),
    obstacles: z.array(scenarioObstaclesSchema),
    options: scenarioDataOptionsSchema,
  }),
  completed: z.boolean(),
  completionTime: z.date().nullable(),
});
export type PreviewOnline = z.infer<typeof PreviewOnlineSchema>;
