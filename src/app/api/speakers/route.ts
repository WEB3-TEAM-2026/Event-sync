

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizer, isNextResponse } from "@/lib/auth/requireOrganizer";

export async function GET() {
  try {
    const speakers = await prisma.speaker.findMany({
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: speakers,
      count: speakers.length,
    });
  } catch (error) {
    console.error("[GET /api/speakers]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
