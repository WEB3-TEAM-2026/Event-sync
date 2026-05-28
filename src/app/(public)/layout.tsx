import { PublicSidebar } from "@/components/layout/PublicSideBar";
import { FavoritesProvider } from "@/components/events/FavoritesContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <div className="flex min-h-screen bg-[var(--background)]">
        <PublicSidebar />
        <main className="flex-1 min-w-0 pl-0 lg:pl-0">
          <div className="max-w-5xl mx-auto px-5 py-8 lg:px-10 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </FavoritesProvider>
  );
}