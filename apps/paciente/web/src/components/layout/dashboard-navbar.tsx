'use client'

import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { ExchangeRateCompact } from "@/components/currency/exchange-rate-widget";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { supabase } from "@/lib/supabase/client";

import { UserAvatar } from "./user-avatar";

interface PatientNavbarProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  unreadCount?: number;
  notificationCount?: number;
  onMenuClick?: () => void;
}

export function PatientNavbar({
  userName,
  userEmail,
  avatarUrl,
  unreadCount = 0,
  notificationCount = 0,
  onMenuClick,
}: PatientNavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/buscar-medico?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
      <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6 gap-2">
        {/* Hamburger — visible up to lg */}
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Abrir menú de navegación"
            className="lg:hidden p-2 -ml-1 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-[hsl(var(--foreground))] hidden sm:block">Red-Salud</span>
        </Link>

        {/* Search bar (hidden on mobile, shown on md+) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar medico, especialidad..."
              className="w-full pl-9 pr-4 py-2 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-[hsl(var(--card))] transition"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Exchange rate compact */}
          <div className="hidden lg:block">
            <ExchangeRateCompact />
          </div>

          {/* Theme toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Messages */}
          <Link
            href="/dashboard/mensajes"
            className="relative p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition"
            aria-label={`Mensajes${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
          >
            <MessageSquare className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Notifications bell */}
          <NotificationBell unreadCount={notificationCount} />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 p-1 sm:pl-1 sm:pr-2 hover:bg-[hsl(var(--muted))] rounded-full sm:rounded-xl transition"
            >
              <UserAvatar name={userName} avatarUrl={avatarUrl} size="sm" />
              <span className="text-sm font-medium text-[hsl(var(--foreground))] hidden sm:block max-w-[120px] truncate">
                {userName || "Paciente"}
              </span>
              <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))] hidden sm:block" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-64 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
                  <UserAvatar name={userName} avatarUrl={avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                      {userName || "Paciente"}
                    </p>
                    {userEmail && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/perfil"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    Mi Perfil
                  </Link>
                  <div className="border-t border-[hsl(var(--border))] my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
