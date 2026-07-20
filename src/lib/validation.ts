import { z } from "zod";

export const OWNERS = ["JAVIER", "ANDY"] as const;
export const IMPORTANCE_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;

export const pendingSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(2000),
  topic: z.string().trim().min(1, "Topic is required").max(60),
  dueDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date",
  }),
  importance: z.enum(IMPORTANCE_LEVELS),
  owner: z.enum(OWNERS),
});

export type PendingFormValues = z.infer<typeof pendingSchema>;
