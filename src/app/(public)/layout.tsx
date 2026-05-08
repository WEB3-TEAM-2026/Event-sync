import { PublicSidebar } from "@/components/layout/PublicSideBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PublicSidebar />
      
      <main className="flex-1 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}