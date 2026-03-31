import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  KeyRound,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AdminSetup() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const isLoggingIn = loginStatus === "logging-in";
  const isAuthenticated = !!identity;
  const isConnecting = isAuthenticated && (isFetching || !actor);

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState<"claim" | "reset" | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!token.trim()) {
      toast.error("Enter your admin token");
      return;
    }
    if (!actor) {
      toast.error("Still connecting to backend, please wait a moment");
      return;
    }
    setLoading("claim");
    try {
      await actor._initializeAccessControlWithSecret(token.trim());
      setSuccess("Admin access claimed! You are now the admin.");
      toast.success("Admin access claimed!");
      setTimeout(() => navigate({ to: "/admin" }), 1500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already") || msg.includes("registered")) {
        toast.error(
          'An admin is already registered. Use "Reset & Reclaim" first.',
        );
      } else {
        toast.error("Invalid token or already registered");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleResetAndClaim = async () => {
    if (!token.trim()) {
      toast.error("Enter your admin token");
      return;
    }
    if (!actor) {
      toast.error("Still connecting to backend, please wait a moment");
      return;
    }
    if (
      !confirm(
        "This will remove all existing users and admin assignments. Continue?",
      )
    )
      return;
    setLoading("reset");
    try {
      const ok = await actor.resetAdminAccess(token.trim());
      if (!ok) {
        toast.error("Invalid admin token");
        setLoading(null);
        return;
      }
      await actor._initializeAccessControlWithSecret(token.trim());
      setSuccess("Admin reset and reclaimed! You are now the admin.");
      toast.success("Admin access reset and reclaimed!");
      setTimeout(() => navigate({ to: "/admin" }), 1500);
    } catch {
      toast.error("Failed to reset admin access");
    } finally {
      setLoading(null);
    }
  };

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
            <Shield className="w-8 h-8" style={{ color: "#FF6B35" }} />
          </div>
          <h1 className="font-display text-2xl" style={{ color: "#f0e6d3" }}>
            Admin Setup
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            Claim or reset admin access for UrbanPulse
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-6"
        >
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
              <p className="text-center text-white/80">{success}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-white/60">
                  {!isAuthenticated
                    ? "First, sign in with Internet Identity. Then enter your admin token to claim admin access."
                    : "Enter your admin token to claim or reset admin access."}
                </p>
                {isAuthenticated && !isConnecting && (
                  <p className="text-xs text-green-400/80">
                    ✓ Signed in — ready to claim admin
                  </p>
                )}
                {isConnecting && (
                  <p className="text-xs text-amber-400/80 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Connecting to backend…
                  </p>
                )}
              </div>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => login()}
                  disabled={isLoggingIn}
                  className="w-full py-3 px-6 rounded-xl font-display font-bold text-base transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
                  style={{ background: "#FF6B35" }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    "Sign In with Internet Identity"
                  )}
                </button>
              ) : (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="admin-token"
                      className="text-xs text-white/50 font-medium uppercase tracking-wider"
                    >
                      Admin Token
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="admin-token"
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter your admin token"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FF6B35]/50"
                        onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                      />
                    </div>
                    <p className="text-xs text-white/30">
                      Find your admin token in your Caffeine project settings
                      under the admin token section.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleClaim}
                      disabled={loading !== null || isConnecting}
                      className="w-full py-3 px-6 rounded-xl font-display font-bold text-base transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
                      style={{ background: "#FF6B35" }}
                    >
                      {loading === "claim" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Claiming...
                        </>
                      ) : isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" /> Claim Admin Access
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleResetAndClaim}
                      disabled={loading !== null || isConnecting}
                      className="w-full py-3 px-6 rounded-xl font-display font-bold text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#f87171",
                      }}
                    >
                      {loading === "reset" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Resetting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" /> Reset & Reclaim
                          Admin
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-white/25">
                      "Reset & Reclaim" clears all users and reassigns admin to
                      your current identity.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
