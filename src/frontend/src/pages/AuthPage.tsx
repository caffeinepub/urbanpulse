import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, MapPin, Shield, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  {
    key: "gps",
    icon: <MapPin className="w-4 h-4" style={{ color: "#FF6B35" }} />,
    text: "Report city issues with GPS location",
  },
  {
    key: "upvote",
    icon: <Users className="w-4 h-4 text-blue-400" />,
    text: "Upvote and follow issues in your area",
  },
  {
    key: "secure",
    icon: <Shield className="w-4 h-4 text-green-400" />,
    text: "Secure, decentralized identity — no passwords",
  },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";
  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(255,107,53,0.1) 0%, transparent 60%), #0a1628",
      }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "rgba(255,107,53,0.2)",
              border: "1px solid rgba(255,107,53,0.3)",
            }}
          >
            <Zap className="w-8 h-8" style={{ color: "#FF6B35" }} />
          </div>
          <h1 className="font-display text-3xl">
            <span style={{ color: "#f0e6d3" }}>Urban</span>
            <span style={{ color: "#FF6B35" }}>Pulse</span>
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            Crowdsourced city issue tracker
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-6"
          data-ocid="auth.panel"
        >
          <div className="text-center space-y-2">
            <h2 className="font-display text-xl" style={{ color: "#f0e6d3" }}>
              Welcome
            </h2>
            <p className="text-sm text-white/50">
              Sign in with Internet Identity to report issues, upvote, and track
              your neighborhood
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-3 text-sm text-white/60"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                {f.text}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-base transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
            style={{ background: isLoggingIn ? "#e55a25" : "#FF6B35" }}
            data-ocid="auth.login.button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In with Internet Identity
              </>
            )}
          </button>

          <p className="text-xs text-center text-white/30">
            Internet Identity is a secure, privacy-preserving authentication
            system on the Internet Computer
          </p>
        </motion.div>

        <p className="text-center text-xs text-white/25 mt-6">
          &copy; {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors"
          >
            Built with &hearts; using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
