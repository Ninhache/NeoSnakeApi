import { z } from "zod";
export const CampaignMapCompletionSchema = z.object({
  userId: z.number(),
  mapId: z.string(),
  completionTime: z.number(),
  completionDate: z.number(),
});
