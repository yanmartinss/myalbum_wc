import z from "zod";

export const sharedAlbumSchema = z.object({
  group: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(72),
});

export type SharedAlbumFilters = z.infer<typeof sharedAlbumSchema>;
