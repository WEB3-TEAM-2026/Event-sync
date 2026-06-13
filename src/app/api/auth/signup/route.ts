import { NextRequest, NextResponse } from "next/server";
import { createOrganizer } from "@/lib/auth/create-user";
import { signupSchema, validateBody } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const res = await validateBody(request, signupSchema);
  if (res.error) return res.error;
  const { email, password, name } = res.data;

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
