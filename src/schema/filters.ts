import { z } from "zod";

export const PaginationSchema = z.object({
  page: z.preprocess((input) => {
    if (typeof input === "string") {
      return parseInt(input, 10);
    }
    return input;
  }, z.number().min(1, "Page must be at least 1").default(1)),
  limit: z.preprocess((input) => {
    if (typeof input === "string") {
      return parseInt(input, 10);
    }
    return input;
  }, z.number().min(1, "Limit must be at least 1").max(100, "Limit can be at most 100").default(10)),
});

export const OnlineMapFilterSchema = z.object({
  name: z.string().optional(),
  sortDate: z.enum(["asc", "desc"]).default("desc"),
  difficulty: z.preprocess((input) => {
    if (typeof input === "string") {
      return parseInt(input, 10);
    }
    return input;
  }, z.number().min(1, "Difficulty must be at least 1").max(5, "Difficulty can be at most 5").optional()),
});
