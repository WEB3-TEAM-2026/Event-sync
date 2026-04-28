import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/response";

type Params = { params: { id: string; questionId: string } };

// POST questions/[questionId]/upvote
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.questionId, sessionId: params.id },
    });

    if (!question) return notFound("Question not found");

    const updated = await prisma.question.update({
      where: { id: params.questionId },
      data: { upvotes: { increment: 1 } },
    });

    return ok(updated);
  } catch (err) {
    console.error("[POST /api/sessions/[id]/questions/[questionId]/upvote]", err);
    return serverError();
  }
}
