"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquarePlus,
  CalendarHeart,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/invitees", label: "参加者一覧", icon: Users },
  { href: "/messages", label: "声掛け文", icon: MessageSquarePlus },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 border-r bg-background shrink-0" style={{ height: "100dvh" }}>
        <div className="flex items-center gap-2 px-4 py-5 border-b">
          <CalendarHeart className="h-6 w-6 text-rose-500" />
          <span className="font-bold text-sm leading-tight">
            結婚式二次会
            <br />
            <span className="text-muted-foreground font-normal">出欠管理</span>
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
      </aside>

      {/* ── Mobile: top header ───────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-background border-b"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: "max(env(safe-area-inset-left), 1rem)",
          paddingRight: "max(env(safe-area-inset-right), 1rem)",
          paddingBottom: "0.75rem",
          paddingBlockStart: "calc(env(safe-area-inset-top) + 0.75rem)",
        }}
      >
        <div className="flex items-center gap-2">
          <CalendarHeart className="h-5 w-5 text-rose-500" />
          <span className="font-bold text-sm">結婚式二次会 出欠管理</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ── Mobile: bottom tab bar ───────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* ── Mobile: drawer overlay ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-background flex flex-col shadow-2xl"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <div className="flex items-center gap-2">
                <CalendarHeart className="h-5 w-5 text-rose-500" />
                <span className="font-bold text-sm">結婚式二次会 出欠管理</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-accent"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
            <div
              className="p-4 border-t text-xs text-muted-foreground"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
            >
              二次会 出欠管理ツール
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
