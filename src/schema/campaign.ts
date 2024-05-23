import { z } from "zod";
import {
  scenarioDataOptionsSchema,
  scenarioFruitsSchema,
  scenarioObstaclesSchema,
} from "./map";
export const CampaignMapCompletionSchema = z.object({
  map_id: z.preprocess((val) => {
    if (typeof val === "string") {
      return parseInt(val);
    }
    return val;
  }, z.number()),
  completionTime: z.number(),
  completionDate: z.number(),
});
export type CampaignMapCompletion = z.infer<typeof CampaignMapCompletionSchema>;

export const PreviewCampaignSchema = z.object({
  id: z.number(),

  fruits: z.array(scenarioFruitsSchema),
  obstacles: z.array(scenarioObstaclesSchema),
  options: scenarioDataOptionsSchema,

  name: z.string(),
  completed: z.boolean(),
});
export type PreviewCampaign = z.infer<typeof PreviewCampaignSchema>;
