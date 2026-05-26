import { PublicSidebar } from "@/components/layout/PublicSideBar";
import { FavoritesProvider } from "@/components/events/FavoritesContext";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FavoritesProvider>
      <div className="flex min-h-screen bg-gray-50">
        <PublicSidebar />
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </FavoritesProvider>
  );
}
