import { z } from "zod";
export const OnlineMapCompletionSchema = z.object({
  user_id: z.number(),
  map_id: z.string(),
  completionTime: z.number(),
  completionDate: z.number(),
});
