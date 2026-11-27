import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { buttonClass } from "../shared/components/buttonClass";
import Logo from "../shared/components/Logo";
import SampleDataBanner from "../shared/components/SampleDataBanner";
import PublicFooter from "./PublicFooter";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/map", label: "Explore Map" },
  { to: "/issues", label: "All Issues" },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand-soft text-brand" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
  }`;

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isMap = pathname === "/map";

  return (
    <div className={`flex flex-col bg-white ${isMap ? "h-dvh" : "min-h-screen"}`}>
      <header className="sticky top-0 z-[500] shrink-0 border-b border-line bg-white/90 backdrop-blur">
        <SampleDataBanner />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="CivicConnect home" onClick={() => setMenuOpen(false)}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/admin/login" className={buttonClass("secondary", "sm", "hidden sm:inline-flex")}>
              Admin sign in
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden" aria-label="Mobile">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/admin/login" className={linkClass} onClick={() => setMenuOpen(false)}>
              Admin sign in
            </NavLink>
          </nav>
        )}
      </header>

      <main className={isMap ? "min-h-0 flex-1" : "flex-1"}>
        <Outlet />
      </main>

      {!isMap && <PublicFooter />}
    </div>
  );
}
