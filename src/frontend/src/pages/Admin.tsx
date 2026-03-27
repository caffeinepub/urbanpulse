import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Loader2,
  Shield,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  useDeleteIssue,
  useGetAdminStats,
  useGetIssues,
  useIsCallerAdmin,
  useUpdateIssueStatus,
} from "../hooks/useQueries";
import type { Issue } from "../hooks/useQueries";

const STATUSES = ["Open", "InProgress", "Resolved"];

function StatCard({
  label,
  value,
  icon,
  color,
  loading,
  index,
}: {
  label: string;
  value: number | bigint;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-5 flex items-center gap-4"
      data-ocid="admin.stats.card"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/50 font-medium">{label}</p>
        {loading ? (
          <Skeleton
            className="h-7 w-12 mt-1"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
        ) : (
          <p
            className="font-display text-2xl font-bold"
            style={{ color: "#f0e6d3" }}
          >
            {Number(value)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: issues, isLoading: issuesLoading } = useGetIssues();
  const updateStatus = useUpdateIssueStatus();
  const deleteIssue = useDeleteIssue();

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      navigate({ to: "/login" });
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleStatusChange = async (id: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this issue? This cannot be undone.")) return;
    try {
      await deleteIssue.mutateAsync(id);
      toast.success("Issue deleted");
    } catch {
      toast.error("Failed to delete issue");
    }
  };

  if (adminLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#FF6B35" }}
        />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(255,107,53,0.2)",
            border: "1px solid rgba(255,107,53,0.3)",
          }}
        >
          <Shield className="w-5 h-5" style={{ color: "#FF6B35" }} />
        </div>
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "#f0e6d3" }}
          >
            Admin Dashboard
          </h1>
          <p className="text-sm text-white/50">Manage reported city issues</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Reports"
          value={stats?.totalIssues ?? 0n}
          icon={<BarChart3 className="w-5 h-5" style={{ color: "#FF6B35" }} />}
          color=""
          loading={statsLoading}
          index={0}
        />
        <StatCard
          label="Open Issues"
          value={stats?.openIssues ?? 0n}
          icon={<AlertCircle className="w-5 h-5 text-orange-400" />}
          color="bg-orange-500/10"
          loading={statsLoading}
          index={1}
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress ?? 0n}
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          color="bg-blue-500/10"
          loading={statsLoading}
          index={2}
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved ?? 0n}
          icon={<CheckCircle className="w-5 h-5 text-green-400" />}
          color="bg-green-500/10"
          loading={statsLoading}
          index={3}
        />
      </div>

      <div className="glass-card overflow-hidden" data-ocid="admin.table">
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid rgba(0,201,177,0.1)" }}
        >
          <h2 className="font-display font-bold" style={{ color: "#f0e6d3" }}>
            All Issues
          </h2>
        </div>
        <div className="overflow-x-auto">
          {issuesLoading ? (
            <div className="p-6 space-y-4" data-ocid="admin.loading_state">
              {["a", "b", "c", "d", "e"].map((k) => (
                <Skeleton
                  key={k}
                  className="h-12 w-full rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              ))}
            </div>
          ) : !issues || issues.length === 0 ? (
            <div
              className="py-16 flex flex-col items-center gap-3"
              data-ocid="admin.empty_state"
            >
              <AlertCircle className="w-10 h-10 text-white/20" />
              <p className="text-white/50">No issues reported yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,201,177,0.08)" }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">
                    Upvotes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue: Issue, idx: number) => (
                  <tr
                    key={String(issue.id)}
                    className="hover:bg-white/3 transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    data-ocid={`admin.issue.row.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {issue.photoUrl ? (
                          <img
                            src={issue.photoUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white/90 truncate max-w-[180px]">
                            {issue.title}
                          </p>
                          <p className="text-xs text-white/40 truncate max-w-[180px]">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-white/60">
                        {issue.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={issue.status}
                        onValueChange={(val) =>
                          handleStatusChange(issue.id, val)
                        }
                      >
                        <SelectTrigger
                          className="w-36 h-8 bg-white/5 border-white/10 text-white text-xs"
                          data-ocid={`admin.status.select.${idx + 1}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            background: "#0d1f3c",
                            border: "1px solid rgba(0,201,177,0.15)",
                          }}
                        >
                          {STATUSES.map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="text-white/80 focus:bg-[#FF6B35]/10 text-xs"
                            >
                              {s === "InProgress" ? "In Progress" : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-white/60">
                        {Number(issue.upvotes)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(issue.id)}
                        disabled={deleteIssue.isPending}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        data-ocid={`admin.delete.button.${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-white/25">
        &copy; {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/50 transition-colors"
        >
          Built with &hearts; using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
