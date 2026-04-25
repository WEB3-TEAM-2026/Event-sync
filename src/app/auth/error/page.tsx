import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Email ou mot de passe invalide.",
  SessionRequired: "Vous devez être connecté pour accéder à cette page.",
  default: "Une erreur est survenue lors de la connexion."
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const message = searchParams.error
    ? ERROR_MESSAGES[searchParams.error] ?? searchParams.error
    : ERROR_MESSAGES.default;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Erreur d`&aposauthentification</h1>
        <p className="mt-4 text-slate-700">{message}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/auth/signin"
            className="inline-flex justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </main>
  );
}
