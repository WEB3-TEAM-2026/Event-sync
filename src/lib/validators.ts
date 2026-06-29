import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type RequestWithBody = Request | NextRequest;

export const eventSchema = z
  .object({
    title: z.string().min(1, "Le titre est requis."),
    description: z.string().min(1, "La description est requise."),
    startDate: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Dates invalides." }),
    endDate: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Dates invalides." }),
    location: z.string().min(1, "Le lieu est requis."),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La date de fin doit être après la date de début." });
    }
  });

export const eventUpdateSchema = z
  .object({
    title: z.string().min(1, "Le titre est requis.").optional(),
    description: z.string().min(1, "La description est requise.").optional(),
    startDate: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Dates invalides." }).optional(),
    endDate: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Dates invalides." }).optional(),
    location: z.string().min(1, "Le lieu est requis.").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La date de fin doit être après la date de début." });
      }
    }
  });

export const sessionSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  startTime: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Heure de début invalide." }),
  endTime: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Heure de fin invalide." }),
  roomId: z.string().min(1, "Le roomId est requis."),
  capacity: z.number().int().positive().optional(),
  speakers: z.array(z.string()).optional(),
});

export const sessionCreateSchema = sessionSchema.extend({
  eventId: z.string().min(1, "L'eventId est requis."),
});

export const sessionUpdateSchema = z
  .object({
    title: z.string().min(1, "Le titre est requis.").optional(),
    description: z.string().min(1, "La description est requise.").optional(),
    startTime: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Heure de début invalide." }).optional(),
    endTime: z.string().refine((s) => !isNaN(Date.parse(s)), { message: "Heure de fin invalide." }).optional(),
    roomId: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    speakerIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (end <= start) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "L'heure de fin doit être après l'heure de début." });
      }
    }
  });

export const linkSpeakerSchema = z.object({ speakerId: z.string().min(1, "speakerId requis.") });

export const questionSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu est requis.")
    .max(1000, "La question ne peut pas dépasser 1000 caractères."),
  authorName: z.string().nullable().optional(),
});

export const speakerUpdateSchema = z.object({
  fullName: z.string().min(1, "Le nom est requis.").optional(),
  profilePhoto: z.string().url().optional(),
  bio: z.string().min(1, "La bio est requise.").optional(),
  externalLinks: z.record(z.string()).optional(),
});

export const speakerSchema = z.object({
  fullName: z.string().min(1, "Le nom est requis."),
  profilePhoto: z.string().url().optional(),
  bio: z.string().min(1, "La bio est requise."),
  externalLinks: z.record(z.string()).optional(),
});

export const signupSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  name: z.string().min(1, "Le nom est requis."),
});

export const roomSchema = z.object({
  name: z.string().min(1, "Le nom est requis."),
});

export async function validateBody<T extends z.ZodTypeAny>(request: RequestWithBody, schema: T) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return { error: NextResponse.json({ success: false, error: "Requête invalide." }, { status: 400 }) };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: NextResponse.json({ success: false, error: first.message || "Requête invalide." }, { status: 400 }) };
  }

  return { data: parsed.data };
}

export default {
  eventSchema,
  sessionSchema,
  speakerSchema,
  signupSchema,
  validateBody,
};
