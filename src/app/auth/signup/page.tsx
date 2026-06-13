"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Impossible de créer le compte.");
      return;
    }

    router.push("/auth/signin?registered=1");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-indigo-600">EventSync</span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">Créer un compte organisateur</h1>
        <p className="mt-1 text-sm text-slate-500">
          Inscris-toi pour créer et gérer tes événements.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nom complet</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Alice Dupont"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="alice@exemple.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Au moins 8 caractères"
              required
              minLength={8}
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Création du compte…" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Déjà inscrit ?{" "}
          <Link href="/auth/signin" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
