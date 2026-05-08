

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";          
import { authOptions } from "@/lib/auth/auth";  
import { prisma } from "@/lib/prisma";

export type AuthorizedUser = {
  id: string;
  email: string;
  role: string;
};

type RequireOrganizerSuccess = { user: AuthorizedUser };
type RequireOrganizerResult = RequireOrganizerSuccess | NextResponse;


export async function requireOrganizer(
  request: Request
): Promise<RequireOrganizerResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: "Non authentifié. Veuillez vous connecter.",
      },
      { status: 401 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, email: true, role: true },
  });

  if (!dbUser) {
    return NextResponse.json(
      {
        success: false,
        error: "Utilisateur introuvable.",
      },
      { status: 401 }
    );
  }

  if (dbUser.role !== "ORGANIZER") {
    return NextResponse.json(
      {
        success: false,
        error: "Accès refusé. Rôle ORGANIZER requis.",
      },
      { status: 403 }
    );
  }

  return { user: dbUser };
}


export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
