import { Camera, ExternalLink, LayoutDashboard, ListChecks, LogOut, Menu, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Logo from "../shared/components/Logo";
import SampleDataBanner from "../shared/components/SampleDataBanner";

const LINKS = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/incidents", label: "Incidents", icon: ListChecks },
  { to: "/admin/cameras", label: "Cameras", icon: Camera },
  { to: "/admin/video-upload", label: "Video upload", icon: UploadCloud },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex h-full flex-col bg-navy px-3 py-4">
      <div className="px-2 pb-6">
        <Logo tone="light" subtitle="Operations console" />
      </div>

      <nav className="flex flex-col gap-1" aria-label="Admin">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onNavigate}>
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-4" />
          Public portal
        </Link>
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-lg bg-white/5 p-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">
          {initials(user?.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const current = LINKS.find((link) => pathname.startsWith(link.to));

  useEffect(() => {
    if (!drawerOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-screen">
        <Sidebar />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-[900] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-2xl">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <SampleDataBanner />
        <header className="sticky top-0 z-[400] flex h-14 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            className="-ml-1 rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {drawerOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <p className="text-sm text-mute">
            Admin <span className="mx-1 text-slate-300">/</span>
            <span className="font-medium text-ink">{current?.label ?? "Console"}</span>
          </p>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
