import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";

// DELETE /api/sessions/[id]/questions/[questionId] ORGANISATEUR
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const auth = await requireOrganizer(request);
  if (isNextResponse(auth)) return auth;

  const { id: sessionId, questionId } = await params;

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId, sessionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question non trouvée." },
        { status: 404 }
      );
    }

    await prisma.question.delete({ where: { id: questionId } });

    return NextResponse.json({ success: true, message: "Question supprimée." });
  } catch (error) {
    console.error("[DELETE /api/sessions/:id/questions/:questionId]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
