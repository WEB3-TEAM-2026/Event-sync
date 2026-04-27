import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";


export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ORGANIZER") {
    redirect("/");
  }

  return session;
}


export async function getCurrentSession() {
  return await getServerSession(authOptions);
}
