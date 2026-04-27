import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, error, notFound, serverError } from "@/lib/api-response";

const createQuestionSchema = z.object({
  content: z.string().min(1, "Question content is required").max(500),
  authorName: z.string().max(100).optional(),
});

type Params = { params: { id: string } };

// GET /api/sessions/[id]/questions — public
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await prisma.session.findUnique({ where: { id: params.id } });
    if (!session) return notFound("Session not found");

    const questions = await prisma.question.findMany({
      where: { sessionId: params.id },
      orderBy: { upvotes: "desc" },
    });

    return ok(questions);
  } catch (err) {
    console.error("[GET /api/sessions/[id]/questions]", err);
    return serverError();
  }
}

// POST /api/sessions/[id]/questions — public (only when session is live)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await prisma.session.findUnique({ where: { id: params.id } });
    if (!session) return notFound("Session not found");

    const now = new Date();
    const isLive = session.startTime <= now && session.endTime >= now;

    if (!isLive) {
      return error("Questions can only be submitted during a live session", 403);
    }

    const body = await req.json();
    const parsed = createQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.errors[0].message);
    }

    const question = await prisma.question.create({
      data: {
        content: parsed.data.content,
        authorName: parsed.data.authorName ?? null,
        sessionId: params.id,
      },
    });

    return created(question);
  } catch (err) {
    console.error("[POST /api/sessions/[id]/questions]", err);
    return serverError();
  }
}
