import { z } from "zod";
export const OnlineMapCompletionSchema = z.object({
  userId: z.number(),
  mapId: z.string(),
  completionTime: z.number(),
  completionDate: z.number(),
});
