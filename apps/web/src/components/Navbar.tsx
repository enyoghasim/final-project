import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { useAuth } from "../lib/authContext";
import { useAuthConfig } from "../lib/useAuthConfig";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-full px-3 py-1.5 text-sm font-bold transition-colors",
    isActive ? "bg-black text-white" : "text-slate-700 hover:bg-slate-100",
  ].join(" ");
}

function mobileNavLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-lg px-3 py-2.5 text-base font-bold transition-colors",
    isActive ? "bg-black text-white" : "text-slate-700 hover:bg-slate-100",
  ].join(" ");
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: authConfig } = useAuthConfig();
  const signupDisabled = authConfig?.signupDisabled ?? true;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b-2 border-black bg-[#fffaf3]">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-slate-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-accent text-black">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-base font-extrabold tracking-tight">Resume AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1.5 sm:flex">
          {isAuthenticated ? (
            <>
              <NavLink to="/upload" className={navLinkClass}>
                Evaluate
              </NavLink>
              <NavLink to="/history" className={navLinkClass}>
                History
              </NavLink>
              <div className="ml-3 flex items-center gap-3 border-l-2 border-black pl-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-accent-100 text-xs font-bold text-black">
                    {user ? initials(user.fullName) : ""}
                  </span>
                  <span className="hidden text-sm font-medium text-slate-600 lg:inline">
                    {user?.fullName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-brut bg-white px-3 py-1.5 text-slate-900"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-1.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Log in
              </Link>
              {!signupDisabled && (
                <Link to="/signup" className="btn-brut bg-accent px-4 py-1.5 text-black">
                  Sign up
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-white sm:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t-2 border-black bg-[#fffaf3] px-4 py-4 sm:hidden">
          <div className="flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <div className="mb-2 flex items-center gap-2 px-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-accent-100 text-xs font-bold text-black">
                    {user ? initials(user.fullName) : ""}
                  </span>
                  <span className="text-sm font-medium text-slate-600">{user?.fullName}</span>
                </div>
                <NavLink
                  to="/upload"
                  onClick={() => setMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  Evaluate
                </NavLink>
                <NavLink
                  to="/history"
                  onClick={() => setMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  History
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-brut mt-3 justify-center bg-white py-2.5 text-slate-900"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-bold text-slate-700 hover:bg-slate-100"
                >
                  Log in
                </Link>
                {!signupDisabled && (
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="btn-brut mt-2 justify-center bg-accent py-2.5 text-black"
                  >
                    Sign up
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
