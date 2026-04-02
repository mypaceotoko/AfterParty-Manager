import { Sidebar } from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex" style={{ height: "100dvh", overflow: "hidden" }}>
      <Sidebar />
      {/* md: push content right of sidebar; mobile: full width with top header + bottom nav */}
      {/* pt-14: mobile top header height. pb accounts for bottom tab bar + safe area */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}>
        <div className="p-4 md:p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
