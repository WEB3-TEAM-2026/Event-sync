import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, Users, Star, ArrowRight, Radio, Target, Zap, MessageSquare, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero */}
      <section className="pt-6 pb-10 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent)]/20">
            <Radio size={10} className="animate-pulse" />
            Plateforme événements en direct
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[var(--text-primary)]">
          Gérez vos événements<br />
          <span className="brand-gradient">avec style.</span>
        </h1>
        <p className="mt-5 text-[var(--text-secondary)] text-lg max-w-xl leading-relaxed">
          EventSync remplace les programmes statiques par une interface dynamique — planning en temps réel, Q&A live et favoris personnalisés.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/events" className="inline-flex">
            <Button size="lg" className="gap-2">
              Voir les événements <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/auth/signin" className="inline-flex">
            <Button size="lg" variant="outline">
              Espace Organisateur
            </Button>
          </Link>
        </div>
      </section>

      {/* Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Calendar,
            color: "bg-[var(--accent-subtle)] text-[var(--accent-text)]", 
            label: "Événements",
            desc: "Consultez les conférences à venir",
            href: "/events",
            cta: "Parcourir →",
          },
          {
            icon: Users,
            color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
            label: "Intervenants",
            desc: "Découvrez les speakers et leurs sessions",
            href: "/speakers",
            cta: "Découvrir →",
          },
          {
            icon: Star,
            color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
            label: "Mes favoris",
            desc: "Construisez votre planning personnel",
            href: "/favorites",
            cta: "Mon planning →",
          },
        ].map(({ icon: Icon, color, label, desc, href, cta }) => (
          <Link key={href} href={href} className="block">
            <div className="group h-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow)] hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              <p className="text-sm font-medium text-[var(--accent-text)] mt-3 transition-all duration-200 group-hover:translate-x-1 inline-block">
                {cta}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Features */}
      <section className="border border-[var(--border)] rounded-[var(--radius-xl)] p-6 bg-[var(--surface)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5">Fonctionnalités</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { icon: Target, title: "Planning multi-track", desc: "Visualisez toutes les sessions par salle et horaire" },
            { icon: Zap, title: "Sessions Live", desc: "Badge temps réel sur les sessions en cours" },
            { icon: MessageSquare, title: "Q&A en direct", desc: "Posez vos questions pendant les sessions live" },
            { icon: Heart, title: "Favoris", desc: "Sauvegardez vos sessions préférées en local" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 p-3 rounded-xl bg-[var(--surface-hover)]">
              <Icon size={20} className="shrink-0 text-[var(--accent-text)]" />
              <div>
                <p className="font-semibold text-[var(--text-primary)] text-sm">{title}</p>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}