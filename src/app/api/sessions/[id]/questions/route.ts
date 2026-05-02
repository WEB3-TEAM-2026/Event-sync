import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, error, notFound, serverError } from "@/lib/response";

const createQuestionSchema = z.object({
  content: z.string().min(1, "Question content is required").max(500),
  authorName: z.string().max(100).optional(),
});

type Params = { params: { id: string } };

// GET /api/sessions/[id]/questions
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await prisma.session.findUnique({ where: { id: params.id } });
    if (!session) return ("Session not found");

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
