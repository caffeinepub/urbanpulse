import { Link } from "@tanstack/react-router";
import { Activity, Camera, MapPin, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIsCallerAdmin } from "../hooks/useQueries";

// ─── Constants ───────────────────────────────────────────────────────────────
const EASE = [0.25, 0.1, 0.25, 1] as const;
const VIEWPORT = { once: true, margin: "-80px" };

// ─── Glow button helpers ─────────────────────────────────────────────────────
const addGlow = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.boxShadow =
    "0 0 24px rgba(245,158,11,0.6), 0 0 48px rgba(245,158,11,0.25)";
};
const removeGlow = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.boxShadow = "none";
};
const addGlowLg = (e: React.MouseEvent<HTMLElement>) => {
  e.currentTarget.style.boxShadow =
    "0 0 40px rgba(245,158,11,0.7), 0 0 80px rgba(245,158,11,0.3)";
};

// ─── Marquee ticker ───────────────────────────────────────────────────────────
const TICKER_TEXT =
  "LIVE MAP  ·  CITY ISSUES  ·  PHOTO REPORTS  ·  REAL TIME  ·  CIVIC TECH  ·  URBAN PULSE  ·  ";

function MarqueeTicker() {
  return (
    <div
      className="w-full overflow-hidden py-3 relative"
      style={{
        background:
          "linear-gradient(90deg, rgba(245,158,11,0.04) 0%, rgba(245,158,11,0.08) 50%, rgba(245,158,11,0.04) 100%)",
        borderTop: "1px solid rgba(245,158,11,0.15)",
        borderBottom: "1px solid rgba(245,158,11,0.15)",
      }}
      aria-hidden="true"
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 28s linear infinite", width: "200%" }}
      >
        {[0, 1].map((i) => (
          <span
            key={i}
            className="inline-block text-[10px] font-medium tracking-[0.22em] uppercase"
            style={{ color: "rgba(245,158,11,0.5)", width: "50%" }}
          >
            {TICKER_TEXT.repeat(4)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Dot Grid overlay ────────────────────────────────────────────────────────
function DotGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(245,158,11,0.12) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage:
          "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
      }}
      aria-hidden="true"
    />
  );
}

// ─── Circuit Lines SVG ────────────────────────────────────────────────────────
function CircuitLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity: 0.06 }}
    >
      <defs>
        <pattern
          id="circuit"
          x="0"
          y="0"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 60 0 L 60 40 M 60 40 L 90 40 M 90 40 L 90 60"
            stroke="#f59e0b"
            strokeWidth="0.75"
            fill="none"
          />
          <path
            d="M 0 60 L 30 60 M 30 60 L 30 90 M 30 90 L 60 90"
            stroke="#f59e0b"
            strokeWidth="0.75"
            fill="none"
          />
          <path
            d="M 120 60 L 90 60"
            stroke="#f59e0b"
            strokeWidth="0.75"
            fill="none"
          />
          <circle cx="60" cy="40" r="2" fill="#f59e0b" />
          <circle cx="30" cy="60" r="2" fill="#f59e0b" />
          <circle cx="90" cy="60" r="2" fill="#f59e0b" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  );
}

// ─── City Skyline SVG (CTA background) ───────────────────────────────────────
function CitySkyline() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
      viewBox="0 0 1440 220"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ opacity: 0.08 }}
    >
      <path
        d="M0,220 L0,140 L60,140 L60,100 L80,100 L80,60 L100,60 L100,40 L120,40 L120,60 L140,60 L140,100 L160,100 L160,80 L180,80 L180,50 L195,50 L195,30 L210,30 L210,50 L225,50 L225,80 L240,80 L240,120 L270,120 L270,90 L290,90 L290,70 L310,70 L310,50 L330,50 L330,70 L350,70 L350,90 L380,90 L380,110 L400,110 L400,70 L415,70 L415,45 L425,45 L425,25 L435,25 L435,10 L445,10 L445,25 L455,25 L455,45 L465,45 L465,70 L490,70 L490,100 L520,100 L520,75 L540,75 L540,55 L555,55 L555,35 L570,35 L570,55 L585,55 L585,75 L610,75 L610,95 L640,95 L640,65 L660,65 L660,45 L675,45 L675,65 L690,65 L690,95 L720,95 L720,120 L750,120 L750,85 L770,85 L770,60 L785,60 L785,40 L800,40 L800,60 L815,60 L815,85 L840,85 L840,110 L870,110 L870,80 L890,80 L890,55 L905,55 L905,35 L920,35 L920,55 L935,55 L935,80 L960,80 L960,105 L990,105 L990,75 L1010,75 L1010,50 L1025,50 L1025,30 L1040,30 L1040,50 L1055,50 L1055,75 L1080,75 L1080,100 L1110,100 L1110,70 L1130,70 L1130,45 L1145,45 L1145,70 L1160,70 L1160,100 L1190,100 L1190,120 L1220,120 L1220,85 L1240,85 L1240,60 L1255,60 L1255,40 L1270,40 L1270,60 L1285,60 L1285,85 L1310,85 L1310,110 L1340,110 L1340,80 L1360,80 L1360,55 L1380,55 L1380,80 L1400,80 L1400,110 L1440,110 L1440,220 Z"
        fill="#f59e0b"
      />
    </svg>
  );
}

// ─── Corner bracket decoration ────────────────────────────────────────────────
function CornerBrackets() {
  const style = {
    stroke: "rgba(245,158,11,0.4)",
    strokeWidth: 1.5,
    fill: "none",
  };
  return (
    <>
      {/* Top-left */}
      <svg
        className="absolute top-6 left-6 w-8 h-8 pointer-events-none"
        aria-hidden="true"
      >
        <path d="M 30 2 L 2 2 L 2 30" {...style} />
      </svg>
      {/* Top-right */}
      <svg
        className="absolute top-6 right-6 w-8 h-8 pointer-events-none"
        aria-hidden="true"
      >
        <path d="M 0 2 L 28 2 L 28 30" {...style} />
      </svg>
      {/* Bottom-left */}
      <svg
        className="absolute bottom-6 left-6 w-8 h-8 pointer-events-none"
        aria-hidden="true"
      >
        <path d="M 30 28 L 2 28 L 2 0" {...style} />
      </svg>
      {/* Bottom-right */}
      <svg
        className="absolute bottom-6 right-6 w-8 h-8 pointer-events-none"
        aria-hidden="true"
      >
        <path d="M 0 28 L 28 28 L 28 0" {...style} />
      </svg>
    </>
  );
}

// ─── Main LandingPage ───────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: isAdmin } = useIsCallerAdmin();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0c10", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(10,12,16,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(245,158,11,0.2)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 32px rgba(245,158,11,0.06)" : "none",
        }}
        data-ocid="nav.panel"
      >
        <button
          type="button"
          className="flex items-center gap-2.5 group"
          onClick={() => scrollTo("hero")}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{ animation: "pulse-ring 2.5s ease-out infinite" }}
            />
            <MapPin
              className="w-5 h-5 relative z-10 transition-all duration-300 group-hover:scale-110"
              style={{ color: "#f59e0b" }}
            />
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "#ffffff" }}
          >
            Urban<span style={{ color: "#f59e0b" }}>Pulse</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {[
            {
              label: "Features",
              action: () => scrollTo("features"),
              ocid: "nav.features.link",
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="text-sm font-medium transition-all duration-200 hover:text-white relative group"
              style={{ color: "rgba(255,255,255,0.45)" }}
              data-ocid={item.ocid}
            >
              {item.label}
              <span
                className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                style={{ background: "#f59e0b" }}
              />
            </button>
          ))}
          <Link
            to="/map"
            className="text-sm font-medium transition-all duration-200 hover:text-white relative group"
            style={{ color: "rgba(255,255,255,0.45)" }}
            data-ocid="nav.map.link"
          >
            Map
            <span
              className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
              style={{ background: "#f59e0b" }}
            />
          </Link>
          <Link
            to="/report"
            className="text-sm font-medium transition-all duration-200 hover:text-white relative group"
            style={{ color: "rgba(255,255,255,0.45)" }}
            data-ocid="nav.report.link"
          >
            Report
            <span
              className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
              style={{ background: "#f59e0b" }}
            />
          </Link>
          {isAdmin && (
            <Link
              to="/database"
              className="text-sm font-medium px-3 py-1 rounded-md transition-all duration-200"
              style={{
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.3)",
                background: "rgba(245,158,11,0.06)",
              }}
              data-ocid="nav.admin-panel.button"
            >
              Admin Panel
            </Link>
          )}
          <Link
            to="/map"
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 relative overflow-hidden group"
            style={{ background: "#f59e0b", color: "#000000" }}
            onMouseEnter={addGlow}
            onMouseLeave={removeGlow}
            data-ocid="nav.get-started.button"
          >
            <span className="relative z-10">Get Started</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              }}
            />
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden transition-colors duration-200 hover:text-white"
          style={{ color: "rgba(255,255,255,0.6)" }}
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="fixed top-16 left-0 right-0 z-40 py-4 px-6 flex flex-col gap-4"
            style={{
              background: "rgba(10,12,16,0.98)",
              borderBottom: "1px solid rgba(245,158,11,0.15)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              type="button"
              onClick={() => scrollTo("features")}
              className="text-sm py-2 text-left transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Features
            </button>
            <Link
              to="/map"
              className="text-sm py-2 transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onClick={() => setMobileMenuOpen(false)}
              data-ocid="nav.mobile.map.link"
            >
              Map
            </Link>
            <Link
              to="/report"
              className="text-sm py-2 transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onClick={() => setMobileMenuOpen(false)}
              data-ocid="nav.mobile.report.link"
            >
              Report
            </Link>
            {isAdmin && (
              <Link
                to="/database"
                className="text-sm py-2 transition-colors"
                style={{ color: "#f59e0b" }}
                onClick={() => setMobileMenuOpen(false)}
                data-ocid="nav.mobile.admin-panel.button"
              >
                Admin Panel
              </Link>
            )}
            <Link
              to="/map"
              className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: "#f59e0b", color: "#000000" }}
              onClick={() => setMobileMenuOpen(false)}
              data-ocid="nav.mobile.get-started.button"
            >
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        id="hero"
        className="min-h-screen flex items-center justify-center pt-16 overflow-hidden relative"
        style={{ background: "#0a0c10" }}
      >
        {/* Dot grid */}
        <DotGrid />
        {/* Circuit lines */}
        <CircuitLines />

        {/* Bottom radial amber glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(245,158,11,0.18) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Center top glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(245,158,11,0.07) 0%, transparent 65%)",
          }}
          aria-hidden="true"
        />

        {/* Scanline shimmer */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            opacity: 0.025,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(245,158,11,0.5) 0px, rgba(245,158,11,0.5) 1px, transparent 1px, transparent 4px)",
            backgroundSize: "100% 4px",
          }}
          aria-hidden="true"
        />

        {/* Floating amber orb */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "float-orb 6s ease-in-out infinite",
            filter: "blur(40px)",
          }}
          aria-hidden="true"
        />

        <motion.div
          className="max-w-4xl mx-auto px-6 text-center relative z-10"
          style={{ y: heroY }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#f59e0b",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "#f59e0b" }}
            >
              Civic Tech Platform
            </p>
          </motion.div>

          {/* Headline */}
          <h1 className="leading-[0.95] mb-8">
            <motion.span
              className="block text-6xl md:text-8xl lg:text-9xl"
              style={{
                color: "#ffffff",
                fontWeight: 200,
                letterSpacing: "-0.03em",
              }}
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            >
              Your city has
            </motion.span>
            <motion.span
              className="block text-6xl md:text-8xl lg:text-9xl font-black"
              style={{
                color: "#f59e0b",
                letterSpacing: "-0.03em",
                textShadow:
                  "0 0 40px rgba(245,158,11,0.5), 0 0 80px rgba(245,158,11,0.25), 0 0 120px rgba(245,158,11,0.1)",
              }}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
            >
              problems.
            </motion.span>
          </h1>

          {/* Subtext */}
          <motion.p
            className="text-lg max-w-lg mx-auto mb-12 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
          >
            UrbanPulse lets citizens report, track, and resolve urban issues on
            a live city map.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
          >
            <Link
              to="/map"
              className="px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 relative overflow-hidden group"
              style={{ background: "#f59e0b", color: "#000000" }}
              onMouseEnter={addGlow}
              onMouseLeave={removeGlow}
              data-ocid="hero.explore.button"
            >
              <span className="relative z-10 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Explore Map
              </span>
            </Link>
            <Link
              to="/report"
              className="px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 group"
              style={{
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#ffffff",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(245,158,11,0.5)";
                e.currentTarget.style.color = "#f59e0b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.25)";
                e.currentTarget.style.color = "#ffffff";
              }}
              data-ocid="hero.report.button"
            >
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Report Issue
              </span>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="mt-20 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div
              className="flex flex-col items-center gap-1"
              style={{ color: "rgba(245,158,11,0.4)" }}
            >
              <span className="text-[10px] tracking-[0.2em] uppercase">
                Scroll
              </span>
              <div
                className="w-px h-8"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(245,158,11,0.5), transparent)",
                  animation: "scroll-bar 2s ease-in-out infinite",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE TICKER ──────────────────────────────────────────────── */}
      <MarqueeTicker />

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section
        className="py-32 px-6 relative overflow-hidden"
        style={{ background: "#070910" }}
      >
        {/* Subtle top separator gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.4) 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
              style={{ color: "rgba(245,158,11,0.6)" }}
            >
              Process
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold"
              style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
            >
              How it works.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {[
              {
                num: "01",
                title: "Spot the issue",
                desc: "Find a problem anywhere in your city — broken infrastructure, hazards, or neglected areas.",
                icon: (
                  <MapPin className="w-5 h-5" style={{ color: "#f59e0b" }} />
                ),
              },
              {
                num: "02",
                title: "Report it",
                desc: "Pin it on the map with a photo. GPS auto-tags your exact location instantly.",
                icon: (
                  <Camera className="w-5 h-5" style={{ color: "#f59e0b" }} />
                ),
              },
              {
                num: "03",
                title: "Track progress",
                desc: "Watch your report move from Open to In Progress to Resolved in real time.",
                icon: (
                  <Activity className="w-5 h-5" style={{ color: "#f59e0b" }} />
                ),
              },
            ].map((step) => (
              <motion.div
                key={step.num}
                className="relative rounded-2xl p-8 flex flex-col group transition-all duration-300"
                style={{
                  background: "rgba(245,158,11,0.03)",
                  border: "1px solid rgba(245,158,11,0.12)",
                  backdropFilter: "blur(12px)",
                }}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
                whileHover={{
                  borderColor: "rgba(245,158,11,0.3)",
                  background: "rgba(245,158,11,0.06)",
                }}
              >
                {/* Step number big background */}
                <div
                  className="absolute top-4 right-4 text-8xl font-black select-none leading-none"
                  style={{
                    color: "rgba(245,158,11,0.07)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {step.num}
                </div>

                {/* Icon badge */}
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-6 relative z-10"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  {step.icon}
                </div>

                {/* Glowing step number label */}
                <span
                  className="text-xs font-bold tracking-[0.15em] uppercase mb-3 relative z-10"
                  style={{
                    color: "#f59e0b",
                    textShadow: "0 0 20px rgba(245,158,11,0.5)",
                  }}
                >
                  Step {step.num}
                </span>

                <h3
                  className="text-xl font-bold mb-3 relative z-10"
                  style={{ color: "#ffffff" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed relative z-10"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-32 px-6 relative overflow-hidden"
        style={{ background: "#060810" }}
      >
        {/* Top gradient separator */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.3) 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* Side ambient glow */}
        <div
          className="absolute left-0 top-1/2 w-64 h-64 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
            transform: "translateY(-50%)",
            filter: "blur(40px)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
              style={{ color: "rgba(245,158,11,0.6)" }}
            >
              Features
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold"
              style={{ color: "#ffffff", letterSpacing: "-0.02em" }}
            >
              Everything you need.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Live Map",
                desc: "See all reported issues pinned on a city map in real time",
                tag: "Real-time",
              },
              {
                icon: <Camera className="w-6 h-6" />,
                title: "Photo Reports",
                desc: "Attach photo evidence to every issue you report",
                tag: "Visual Proof",
              },
              {
                icon: <Activity className="w-6 h-6" />,
                title: "Status Tracking",
                desc: "Track your report from Open to Resolved",
                tag: "Progress",
              },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                variants={{
                  hidden: { opacity: 0, x: -40 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.5, ease: EASE },
                  },
                }}
              >
                {/* Animated border top */}
                <motion.div
                  style={{
                    borderTop: "1px solid rgba(245,158,11,0.15)",
                    transformOrigin: "left",
                  }}
                  variants={{
                    hidden: { scaleX: 0 },
                    visible: {
                      scaleX: 1,
                      transition: { duration: 0.6, ease: EASE },
                    },
                  }}
                />
                <div
                  className="group flex items-center gap-5 py-6 px-4 -mx-4 rounded-xl cursor-default transition-all duration-300"
                  style={{}}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(245,158,11,0.04)";
                    el.style.borderLeft = "3px solid rgba(245,158,11,0.6)";
                    el.style.paddingLeft = "13px";
                    el.style.boxShadow = "inset 0 0 30px rgba(245,158,11,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "transparent";
                    el.style.borderLeft = "none";
                    el.style.paddingLeft = "16px";
                    el.style.boxShadow = "none";
                  }}
                  data-ocid={`features.item.${i + 1}`}
                >
                  {/* Icon with glow ring */}
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-amber"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.18)",
                      color: "#f59e0b",
                    }}
                  >
                    {feat.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="font-semibold text-base"
                        style={{ color: "#ffffff" }}
                      >
                        {feat.title}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full tracking-wide"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          color: "rgba(245,158,11,0.8)",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        {feat.tag}
                      </span>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {feat.desc}
                    </p>
                  </div>

                  <div
                    className="flex-shrink-0 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: "rgba(245,158,11,0.6)" }}
                  >
                    →
                  </div>
                </div>
              </motion.div>
            ))}
            <motion.div
              style={{
                borderTop: "1px solid rgba(245,158,11,0.15)",
                transformOrigin: "left",
              }}
              variants={{
                hidden: { scaleX: 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.6, ease: EASE },
                },
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section
        id="cta"
        className="py-40 px-6 relative overflow-hidden"
        style={{ background: "#0a0c10" }}
      >
        {/* Top separator */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.3) 50%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* City skyline silhouette */}
        <CitySkyline />

        {/* Strong center glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(245,158,11,0.16) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Dot grid */}
        <DotGrid />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Corner brackets around text block */}
          <div className="relative inline-block px-12 py-2">
            <CornerBrackets />
            <motion.p
              className="text-xs font-semibold tracking-[0.22em] uppercase mb-6"
              style={{ color: "rgba(245,158,11,0.6)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.6, ease: EASE }}
            >
              Join Now
            </motion.p>
          </div>

          <h2 className="leading-tight mb-10">
            <motion.span
              className="block text-4xl md:text-6xl lg:text-7xl"
              style={{
                color: "#ffffff",
                fontWeight: 200,
                letterSpacing: "-0.03em",
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, ease: EASE }}
            >
              Be the first to
            </motion.span>
            <motion.span
              className="block text-4xl md:text-6xl lg:text-7xl font-black"
              style={{
                color: "#ffffff",
                letterSpacing: "-0.03em",
                textShadow: "0 0 60px rgba(245,158,11,0.15)",
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            >
              report an issue
            </motion.span>
            <motion.span
              className="block text-4xl md:text-6xl lg:text-7xl font-black"
              style={{
                color: "#f59e0b",
                letterSpacing: "-0.03em",
                textShadow: "0 0 60px rgba(245,158,11,0.4)",
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            >
              in your city.
            </motion.span>
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-base transition-all duration-300"
              style={{ background: "#f59e0b", color: "#000000" }}
              onMouseEnter={addGlowLg}
              onMouseLeave={removeGlow}
              data-ocid="cta.start-reporting.button"
            >
              <Activity className="w-4 h-4" />
              Start Reporting
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-300"
              style={{
                border: "1px solid rgba(245,158,11,0.3)",
                color: "rgba(245,158,11,0.8)",
                background: "rgba(245,158,11,0.05)",
              }}
              data-ocid="cta.explore-map.button"
            >
              <MapPin className="w-4 h-4" />
              Explore Map
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer
        className="px-6 md:px-10 py-8 relative"
        style={{
          background: "#070910",
          borderTop: "1px solid rgba(245,158,11,0.12)",
        }}
      >
        {/* Subtle footer glow */}
        <div
          className="absolute top-0 left-1/2 w-48 h-px"
          style={{
            background: "rgba(245,158,11,0.3)",
            transform: "translateX(-50%)",
            filter: "blur(2px)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            type="button"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            onClick={() => scrollTo("hero")}
          >
            <MapPin className="w-4 h-4" style={{ color: "#f59e0b" }} />
            <span
              className="text-xs font-bold"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Urban<span style={{ color: "rgba(245,158,11,0.7)" }}>Pulse</span>
            </span>
          </button>

          <div className="flex items-center gap-1">
            {[{ label: "Features", onClick: () => scrollTo("features") }].map(
              (item, i) => (
                <span key={item.label} className="flex items-center gap-1">
                  {i > 0 && (
                    <span
                      style={{ color: "rgba(245,158,11,0.3)" }}
                      className="text-xs"
                    >
                      ·
                    </span>
                  )}
                  <button
                    type="button"
                    className="text-xs transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                </span>
              ),
            )}
            <span
              style={{ color: "rgba(245,158,11,0.3)" }}
              className="text-xs mx-1"
            >
              ·
            </span>
            <Link
              to="/map"
              className="text-xs transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.3)" }}
              data-ocid="footer.map.link"
            >
              Map
            </Link>
            <span
              style={{ color: "rgba(245,158,11,0.3)" }}
              className="text-xs mx-1"
            >
              ·
            </span>
            <Link
              to="/report"
              className="text-xs transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.3)" }}
              data-ocid="footer.report.link"
            >
              Report
            </Link>
          </div>

          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            <span>© {new Date().getFullYear()} UrbanPulse</span>
            <span style={{ color: "rgba(245,158,11,0.3)" }}>·</span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/60"
            >
              Built with ♥ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>

      {/* ── KEYFRAMES ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.6); opacity: 1; }
          70%  { box-shadow: 0 0 0 10px rgba(245,158,11,0); opacity: 0; }
          100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); opacity: 0; }
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }

        @keyframes float-orb {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33%       { transform: translate(-52%, -54%) scale(1.05); }
          66%       { transform: translate(-48%, -46%) scale(0.97); }
        }

        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes scroll-bar {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50%       { opacity: 1;   transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}
