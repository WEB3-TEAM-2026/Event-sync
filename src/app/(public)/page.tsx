import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="py-12 border-b border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-6xl">
          Bienvenue sur <span className="text-blue-600">EventSync</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl">
          La plateforme centralisée pour suivre vos conférences, poser vos questions en direct et gérer vos sessions préférées.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/events">
            <Button className="h-12 px-8">Voir les événements</Button>
          </Link>
          <Link href="/about">
            <Button variant="secondary" className="h-12 px-8">En savoir plus</Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Événements</p>
              <p className="text-2xl font-bold text-gray-900 underline decoration-blue-500">À venir</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}