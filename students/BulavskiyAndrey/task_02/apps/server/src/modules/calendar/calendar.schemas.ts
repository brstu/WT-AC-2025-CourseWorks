import { z } from "zod";
import { EventType } from "@prisma/client";

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().max(200).optional(),
  type: z.nativeEnum(EventType).default(EventType.other)
});

export const updateEventSchema = createEventSchema.partial();

