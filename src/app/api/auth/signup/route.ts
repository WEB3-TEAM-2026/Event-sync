import { NextRequest, NextResponse } from "next/server";
import { createOrganizer } from "@/lib/create-user";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email?.trim() || !password || !name?.trim()) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  try {
    await createOrganizer(email.trim(), password, name.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    const err = error as { code?: string; message?: string };

    if (err.code === "P2002" || err.message?.includes("Unique")) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Impossible de créer le compte. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
