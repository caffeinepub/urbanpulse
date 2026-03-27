import { Link } from "@tanstack/react-router";
import { Github, Instagram, Menu, Twitter, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Custom hook: inView ────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Animated counter ───────────────────────────────────────────────────────
function useCounter(target: number, duration = 1500, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

// ─── Grain texture overlay ──────────────────────────────────────────────────
const grainStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 1,
  opacity: 0.03,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
  backgroundRepeat: "repeat",
  backgroundSize: "128px 128px",
};

// ─── Dot grid background ────────────────────────────────────────────────────
function DotGrid() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="City dot grid pattern"
      >
        <defs>
          <pattern
            id="dotgrid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="rgba(0,212,255,0.12)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, #0a0c10 80%)",
        }}
      />
    </div>
  );
}

// ─── Floating badge ─────────────────────────────────────────────────────────
function FloatingBadge({
  emoji,
  label,
  style,
  animClass,
}: {
  emoji: string;
  label: string;
  style: React.CSSProperties;
  animClass: string;
}) {
  return (
    <div
      className={`absolute hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium select-none ${animClass}`}
      style={{
        ...style,
        background: "rgba(10,12,16,0.85)",
        border: "1px solid rgba(245,158,11,0.35)",
        boxShadow: "0 0 20px rgba(245,158,11,0.15), 0 8px 32px rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        color: "#f0e6d3",
        zIndex: 2,
      }}
    >
      <span className="text-base">{emoji}</span>
      <span>{label}</span>
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ background: "#f59e0b" }}
      />
    </div>
  );
}

// ─── Section fade wrapper ───────────────────────────────────────────────────
function FadeSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      id={id}
      className={`transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Stats item ─────────────────────────────────────────────────────────────
function StatItem({
  target,
  suffix,
  label,
  active,
}: {
  target: number;
  suffix: string;
  label: string;
  active: boolean;
}) {
  const count = useCounter(target, 1500, active);
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4 sm:py-0">
      <span
        className="text-4xl sm:text-5xl font-bold tabular-nums"
        style={{ fontFamily: "Syne, sans-serif", color: "#f59e0b" }}
      >
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm text-white/50 font-medium tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

// ─── Decorative pins data ───────────────────────────────────────────────────
const decorativePins = [
  { left: "10%", top: "15%" },
  { left: "85%", top: "65%" },
  { left: "45%", top: "30%" },
  { left: "70%", top: "80%" },
];

// ─── Star rating ────────────────────────────────────────────────────────────
const stars = [1, 2, 3, 4, 5];

// ─── Main component ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { ref: statsRef, inView: statsInView } = useInView(0.3);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "#0a0c10",
        fontFamily: "DM Sans, system-ui, sans-serif",
      }}
    >
      {/* Grain overlay */}
      <div style={grainStyle} aria-hidden="true" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16"
        style={{
          background: "rgba(10,12,16,0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(16px)",
        }}
        data-ocid="nav.panel"
      >
        {/* Logo — button for accessibility */}
        <button
          type="button"
          className="flex items-center gap-2"
          onClick={() => scrollTo("hero")}
        >
          <span className="text-lg" style={{ color: "#f59e0b" }}>
            📍
          </span>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "Syne, sans-serif", color: "#f59e0b" }}
          >
            UrbanPulse
          </span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {["features", "how-it-works", "community"].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="text-sm text-white/60 hover:text-white transition-colors capitalize"
              data-ocid={`nav.${id}.link`}
            >
              {id === "how-it-works"
                ? "How It Works"
                : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => scrollTo("cta")}
            className="text-sm text-white/60 hover:text-white transition-colors"
            data-ocid="nav.get-started.link"
          >
            Get Started
          </button>
        </nav>

        {/* CTA button */}
        <Link
          to="/report"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-black transition-all duration-200 animate-glow-pulse-amber"
          style={{
            background: "#f59e0b",
            boxShadow:
              "0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.2)",
            fontFamily: "Syne, sans-serif",
          }}
          data-ocid="nav.report.button"
        >
          📍 Report an Issue
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          data-ocid="nav.menu.button"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 py-4 px-6 flex flex-col gap-3"
          style={{
            background: "rgba(10,12,16,0.97)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {["features", "how-it-works", "community", "cta"].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="text-sm text-white/70 hover:text-white py-2 text-left capitalize"
            >
              {id === "how-it-works"
                ? "How It Works"
                : id === "cta"
                  ? "Get Started"
                  : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <Link
            to="/report"
            className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-black"
            style={{ background: "#f59e0b" }}
            data-ocid="nav.mobile.report.button"
          >
            📍 Report an Issue
          </Link>
        </div>
      )}

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      >
        <DotGrid />

        {/* Floating badges */}
        <FloatingBadge
          emoji="🚦"
          label="Streetlight Out"
          style={{ top: "28%", left: "6%" }}
          animClass="animate-float"
        />
        <FloatingBadge
          emoji="🕳️"
          label="Pothole Reported"
          style={{ top: "40%", right: "6%" }}
          animClass="animate-float-slow"
        />
        <FloatingBadge
          emoji="🗑️"
          label="Overflowing Bin"
          style={{ bottom: "28%", left: "10%" }}
          animClass="animate-float"
        />

        {/* Radial ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 30% 60%, rgba(0,212,255,0.04) 0%, transparent 70%)",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Live in 38 cities worldwide
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            <span className="text-white">Your City.</span>
            <br />
            <span className="text-white">Your Voice.</span>
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #f59e0b, #fbbf24, #00d4ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your Fix.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
            UrbanPulse lets citizens report broken streetlights, potholes,
            overflowing bins and more — pinned live on a city heatmap for
            everyone to see.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-black text-sm sm:text-base transition-all duration-200 animate-glow-pulse-amber"
              style={{
                background: "#f59e0b",
                boxShadow:
                  "0 0 24px rgba(245,158,11,0.5), 0 0 48px rgba(245,158,11,0.25)",
                fontFamily: "Syne, sans-serif",
              }}
              data-ocid="hero.explore.button"
            >
              🗺️ Explore the Map
            </Link>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200"
              style={{
                border: "1px solid rgba(0,212,255,0.5)",
                color: "#00d4ff",
                boxShadow: "0 0 16px rgba(0,212,255,0.15)",
                fontFamily: "Syne, sans-serif",
              }}
              data-ocid="hero.report.button"
            >
              📍 Report an Issue
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 animate-bounce">
          <div
            className="w-px h-8"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(245,158,11,0.4))",
            }}
          />
          <span className="text-xs tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────── */}
      <section
        id="stats"
        ref={statsRef}
        className="relative z-10 py-12"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <StatItem
              target={12400}
              suffix="+"
              label="Issues Reported"
              active={statsInView}
            />
            <div
              className="hidden sm:block w-px h-12 mx-2"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, #f59e0b, transparent)",
              }}
            />
            <StatItem
              target={38}
              suffix=""
              label="Cities Active"
              active={statsInView}
            />
            <div
              className="hidden sm:block w-px h-12 mx-2"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, #f59e0b, transparent)",
              }}
            />
            <StatItem
              target={94}
              suffix="%"
              label="Resolution Rate"
              active={statsInView}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <FadeSection className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="text-xs font-semibold tracking-widest uppercase mb-3 block"
              style={{ color: "#f59e0b" }}
            >
              Simple Process
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                emoji: "📍",
                title: "Drop a Pin",
                desc: "Spot an issue anywhere in your city and tag its exact location on the live map.",
              },
              {
                num: "02",
                emoji: "📸",
                title: "Snap & Report",
                desc: "Add a photo and short description so city authorities understand the issue fast.",
              },
              {
                num: "03",
                emoji: "✅",
                title: "Track & Resolve",
                desc: "Watch the status update in real time as your neighborhood issue gets fixed.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative p-7 rounded-2xl group transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(0,212,255,0.12)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 0 24px rgba(0,212,255,0.15), 0 0 48px rgba(0,212,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(0,212,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(0,212,255,0.12)";
                }}
              >
                <span
                  className="absolute top-5 right-6 text-5xl font-black opacity-10 select-none"
                  style={{ fontFamily: "Syne, sans-serif", color: "#00d4ff" }}
                >
                  {step.num}
                </span>
                <div className="text-3xl mb-4">{step.emoji}</div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <FadeSection className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="text-xs font-semibold tracking-widest uppercase mb-3 block"
              style={{ color: "#f59e0b" }}
            >
              Platform Features
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Built for Real Impact
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: "🗺️",
                title: "Live Heatmap",
                desc: "See issue hotspots across your neighborhood in real time. Zoom in on any block and understand the density of unresolved problems.",
              },
              {
                emoji: "📷",
                title: "Photo Reports",
                desc: "Attach photos for faster resolution by city authorities. A picture is worth a thousand words — and a quicker fix.",
              },
              {
                emoji: "🔔",
                title: "Status Alerts",
                desc: "Get notified the moment your reported issue is acknowledged or resolved. Stay in the loop without checking constantly.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="p-7 rounded-2xl group cursor-default transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 0 24px rgba(245,158,11,0.15), 0 0 48px rgba(245,158,11,0.07)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(245,158,11,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.07)";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: "rgba(245,158,11,0.1)" }}
                >
                  {feat.emoji}
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {feat.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── COMMUNITY ──────────────────────────────────────────────────── */}
      <section
        id="community"
        className="relative z-10 py-24 px-6 overflow-hidden"
      >
        {/* Decorative map pins */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {decorativePins.map((pin) => (
            <div
              key={pin.left}
              className="absolute text-2xl opacity-5 select-none"
              style={{ left: pin.left, top: pin.top }}
            >
              📍
            </div>
          ))}
        </div>

        <FadeSection className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="text-xs font-semibold tracking-widest uppercase mb-3 block"
              style={{ color: "#f59e0b" }}
            >
              Community Stories
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Real People. Real Problems.
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #f59e0b, #00d4ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Real Change.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                initials: "MT",
                name: "Marcus T.",
                city: "Lagos, Nigeria",
                color: "#f59e0b",
                quote:
                  "I reported 3 potholes on my street and they were all fixed within 2 weeks. Incredible platform.",
              },
              {
                initials: "PS",
                name: "Priya S.",
                city: "Mumbai, India",
                color: "#00d4ff",
                quote:
                  "Finally a way to hold the city accountable. UrbanPulse made my voice heard by the right people.",
              },
              {
                initials: "JO",
                name: "James O.",
                city: "Nairobi, Kenya",
                color: "#a78bfa",
                quote:
                  "The heatmap showed our whole neighborhood was affected. 200 upvotes later, it got fixed.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="p-7 rounded-2xl flex flex-col gap-5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {t.name}
                    </div>
                    <div className="text-white/40 text-xs">{t.city}</div>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex gap-1">
                  {stars.map((n) => (
                    <span key={n} className="text-amber-400 text-xs">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────── */}
      <section id="cta" className="relative z-10 py-28 px-6">
        <FadeSection>
          <div
            className="max-w-3xl mx-auto text-center rounded-3xl p-12 sm:p-16 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(0,212,255,0.04) 100%)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <div
              className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-3xl pointer-events-none"
              style={{ background: "rgba(245,158,11,0.1)" }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none"
              style={{ background: "rgba(0,212,255,0.08)" }}
              aria-hidden="true"
            />
            <h2
              className="text-4xl sm:text-5xl font-extrabold text-white mb-5 relative"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Ready to fix your city?
            </h2>
            <p className="text-white/55 text-base sm:text-lg mb-10 max-w-xl mx-auto relative">
              Join thousands of citizens making their neighborhoods better, one
              report at a time.
            </p>
            <Link
              to="/map"
              className="relative inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-black text-base sm:text-lg transition-all duration-200 animate-glow-pulse-amber"
              style={{
                background: "#f59e0b",
                boxShadow:
                  "0 0 32px rgba(245,158,11,0.5), 0 0 64px rgba(245,158,11,0.25)",
                fontFamily: "Syne, sans-serif",
              }}
              data-ocid="cta.get-started.button"
            >
              🚀 Get Started Free
            </Link>
          </div>
        </FadeSection>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 border-t px-6 md:px-10 pt-12 pb-8"
        style={{
          background: "#060810",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg" style={{ color: "#f59e0b" }}>
                  📍
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "Syne, sans-serif", color: "#f59e0b" }}
                >
                  UrbanPulse
                </span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Built by citizens, for citizens.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold tracking-widest uppercase text-white/30">
                Company
              </span>
              {["About", "Privacy", "Contact"].map((l) => (
                <button
                  key={l}
                  type="button"
                  className="text-sm text-white/50 hover:text-white transition-colors text-left"
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Social */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold tracking-widest uppercase text-white/30">
                Follow Us
              </span>
              <div className="flex items-center gap-4">
                {[
                  { icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
                  {
                    icon: <Instagram className="w-4 h-4" />,
                    label: "Instagram",
                  },
                  { icon: <Github className="w-4 h-4" />, label: "GitHub" },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 hover:scale-110"
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                    aria-label={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span>
              © {new Date().getFullYear()} UrbanPulse. All rights reserved.
            </span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
