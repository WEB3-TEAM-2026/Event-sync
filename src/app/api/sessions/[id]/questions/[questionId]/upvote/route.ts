import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, notFound, serverError } from "@/lib/response";

// POST /api/sessions/[id]/questions/[questionId]/upvote
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;

    const question = await prisma.question.findUnique({
      where: { id: questionId, sessionId: id },
    });

    if (!question) return notFound("Question not found");

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: { upvotes: { increment: 1 } },
    });

    return ok(updated);
  } catch (err) {
    console.error("[POST /api/sessions/[id]/questions/[questionId]/upvote]", err);
    return serverError();
  }
}
