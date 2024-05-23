import { z } from "zod";
export const CampaignMapCompletionSchema = z.object({
  user_id: z.number(),
  map_id: z.preprocess((val) => {
    if (typeof val === "string") {
      return parseInt(val);
    }
    return val;
  }, z.number()),
  completionTime: z.number(),
  completionDate: z.number(),
});
