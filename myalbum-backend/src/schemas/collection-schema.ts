import z from "zod";

export const collectionSchema = z.object({
  status: z
    .enum(["all", "missing", "duplicates", "owned"])
    .optional()
    .default("all"),
  group: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export type CollectionStatus = z.infer<
  typeof collectionSchema
>["status"];

export type CollectionFilters = z.infer<typeof collectionSchema>;
