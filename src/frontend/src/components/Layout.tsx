import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Database,
  List,
  LogIn,
  LogOut,
  MapIcon,
  Plus,
  Settings,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function NavLink({
  to,
  children,
  active,
}: {
  to: string;
  children: React.ReactNode;
  active: boolean;
}) {
  const ocid = to === "/map" ? "map" : to.replace("/", "");
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active ? "" : "text-white/60 hover:text-white/90 hover:bg-white/5"
      }`}
      style={active ? { color: "#FF6B35" } : {}}
      data-ocid={`nav.${ocid}.link`}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-lg"
          style={{
            background: "rgba(255,107,53,0.1)",
            border: "1px solid rgba(255,107,53,0.2)",
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative">{children}</span>
    </Link>
  );
}

export default function Layout() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const qc = useQueryClient();

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      qc.clear();
    } else {
      await login();
    }
  };

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a1628" }}
    >
      {/* Desktop Top Nav */}
      <header
        className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between px-6"
        style={{
          background: "linear-gradient(135deg, #061018, #0d2035)",
          borderBottom: "1px solid rgba(0,201,177,0.12)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Link
          to="/map"
          className="flex items-center gap-2 group"
          data-ocid="nav.logo.link"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(255,107,53,0.2)",
              border: "1px solid rgba(255,107,53,0.3)",
            }}
          >
            <Zap className="w-4 h-4" style={{ color: "#FF6B35" }} />
          </div>
          <span className="font-display text-lg">
            <span style={{ color: "#f0e6d3" }}>Urban</span>
            <span style={{ color: "#FF6B35" }}>Pulse</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/map" active={pathname === "/map"}>
            Map
          </NavLink>
          <NavLink to="/feed" active={pathname === "/feed"}>
            Feed
          </NavLink>
          <NavLink to="/report" active={pathname === "/report"}>
            Report
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/admin" active={pathname === "/admin"}>
              Admin
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/database" active={pathname === "/database"}>
              Database
            </NavLink>
          )}
        </nav>

        <button
          type="button"
          onClick={handleAuth}
          disabled={isLoggingIn}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white/70 hover:bg-white/5 hover:text-white disabled:opacity-50"
          style={{ border: "1px solid rgba(0,201,177,0.2)" }}
          data-ocid="nav.auth.button"
        >
          {isAuthenticated ? (
            <>
              <LogOut className="w-4 h-4" />
              Logout
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              {isLoggingIn ? "Signing in..." : "Login"}
            </>
          )}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{
          background: "rgba(6, 16, 24, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,201,177,0.15)",
        }}
      >
        <div className="flex items-center justify-around px-2 h-16">
          <MobileNavItem
            to="/map"
            icon={<MapIcon className="w-5 h-5" />}
            label="Map"
            active={pathname === "/map"}
            ocid="mobile.map.link"
          />
          <MobileNavItem
            to="/feed"
            icon={<List className="w-5 h-5" />}
            label="Feed"
            active={pathname === "/feed"}
            ocid="mobile.feed.link"
          />

          {/* Center FAB */}
          <Link
            to="/report"
            className="flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-full transition-all duration-200 animate-pulse-coral"
            style={{
              background: "#FF6B35",
              boxShadow: "0 0 20px rgba(255,107,53,0.4)",
            }}
            data-ocid="mobile.report.button"
          >
            <Plus className="w-6 h-6 text-white" />
          </Link>

          {isAuthenticated && (
            <MobileNavItem
              to="/admin"
              icon={<Settings className="w-5 h-5" />}
              label="Admin"
              active={pathname === "/admin"}
              ocid="mobile.admin.link"
            />
          )}
          {isAuthenticated && (
            <MobileNavItem
              to="/database"
              icon={<Database className="w-5 h-5" />}
              label="DB"
              active={pathname === "/database"}
              ocid="mobile.database.link"
            />
          )}
          <button
            type="button"
            onClick={handleAuth}
            disabled={isLoggingIn}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
              isAuthenticated ? "" : "text-white/50 hover:text-white/80"
            }`}
            style={isAuthenticated ? { color: "#FF6B35" } : {}}
            data-ocid="mobile.auth.button"
          >
            {isAuthenticated ? (
              <LogOut className="w-5 h-5" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium">
              {isAuthenticated ? "Out" : "Login"}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function MobileNavItem({
  to,
  icon,
  label,
  active,
  ocid,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  ocid: string;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
        active ? "" : "text-white/50 hover:text-white/80"
      }`}
      style={active ? { color: "#FF6B35" } : {}}
      data-ocid={ocid}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
