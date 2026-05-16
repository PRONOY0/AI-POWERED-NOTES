import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  plainText: z.string(),
  content: z.any(),
  tags: z.array(z.string()).default([]),
  category: z.string().nullable().optional(),
  isArchived: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export const updateNoteSchema = createNoteSchema.partial();