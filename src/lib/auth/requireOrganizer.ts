/**
 * lib/auth/requireOrganizer.ts
 *
 * Helper centralisé d'authentification / autorisation.
 * Utilisé par toutes les routes qui nécessitent le rôle ORGANIZER.
 *
 * Usage :
 *   const authResult = await requireOrganizer(request);
 *   if (authResult instanceof NextResponse) return authResult; // 401 ou 403
 *   const { user } = authResult;
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";          // adapter à votre lib d'auth
import { authOptions } from "@/lib/auth/authOptions";  // adapter au chemin réel
import { prisma } from "@/lib/prisma";

export type AuthorizedUser = {
  id: string;
  email: string;
  role: string;
};

type RequireOrganizerSuccess = { user: AuthorizedUser };
type RequireOrganizerResult = RequireOrganizerSuccess | NextResponse;

/**
 * Vérifie que la requête provient d'un utilisateur authentifié avec le rôle ORGANIZER.
 *
 * @returns `{ user }` si OK, sinon une `NextResponse` 401 ou 403 prête à être retournée.
 */
export async function requireOrganizer(
  request: Request
): Promise<RequireOrganizerResult> {
  // ── 1. Récupération de la session ──────────────────────────────────────────
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

  // ── 2. Vérification du rôle en base (source of truth) ─────────────────────
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

/**
 * Type-guard : permet à TypeScript de distinguer succès et erreur.
 *
 * @example
 *   const result = await requireOrganizer(request);
 *   if (isNextResponse(result)) return result;
 *   const { user } = result; // AuthorizedUser
 */
export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
