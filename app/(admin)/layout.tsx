import { Sidebar } from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
