import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Database as DatabaseIcon,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  useGetAdminStats,
  useGetIssues,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import type { Issue } from "../hooks/useQueries";

const CATEGORIES = [
  "All",
  "StreetLight",
  "Trash",
  "RoadDamage",
  "Water",
  "Other",
];
const STATUSES = ["All", "Open", "InProgress", "Resolved"];
const CATEGORY_COLORS: Record<string, string> = {
  StreetLight: "#f59e0b",
  Trash: "#10b981",
  RoadDamage: "#ef4444",
  Water: "#3b82f6",
  Other: "#8b5cf6",
};
const STATUS_COLORS: Record<string, string> = {
  Open: "#ef4444",
  InProgress: "#f59e0b",
  Resolved: "#10b981",
};

function formatDate(ns: bigint) {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function truncatePrincipal(p: { toString(): string }) {
  const s = p.toString();
  if (s.length <= 16) return s;
  return `${s.slice(0, 8)}...${s.slice(-6)}`;
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}44`,
        color,
      }}
    >
      {status === "InProgress" ? "In Progress" : status}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}33`,
        color,
      }}
    >
      {category}
    </span>
  );
}

function IssueDetailModal({
  issue,
  onClose,
}: {
  issue: Issue | null;
  onClose: () => void;
}) {
  if (!issue) return null;
  return (
    <Dialog open={!!issue} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: "#0d1f3c",
          border: "1px solid rgba(0,201,177,0.2)",
          color: "#f0e6d3",
        }}
        data-ocid="database.dialog"
      >
        <DialogHeader>
          <DialogTitle
            className="font-display text-xl"
            style={{ color: "#f0e6d3" }}
          >
            {issue.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {issue.photoUrl && (
            <img
              src={issue.photoUrl}
              alt={issue.title}
              className="w-full h-48 object-cover rounded-lg"
              style={{ border: "1px solid rgba(0,201,177,0.15)" }}
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["ID", String(issue.id)],
              ["Category", issue.category],
              ["Status", issue.status],
              ["Upvotes", String(Number(issue.upvotes))],
              ["Latitude", String(issue.lat)],
              ["Longitude", String(issue.lng)],
              ["Reporter", issue.reporterId.toString()],
              ["Created At", formatDate(issue.createdAt)],
              [
                "Resolved At",
                issue.resolvedAt ? formatDate(issue.resolvedAt) : "—",
              ],
            ].map(([label, val]) => (
              <div
                key={label}
                className="p-3 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <p className="text-xs text-white/40 mb-1">{label}</p>
                <p className="text-sm text-white/85 break-all">{val}</p>
              </div>
            ))}
          </div>
          <div
            className="p-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <p className="text-xs text-white/40 mb-1">Description</p>
            <p className="text-sm text-white/85 leading-relaxed">
              {issue.description}
            </p>
          </div>
          {issue.photoUrl && (
            <div
              className="p-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-xs text-white/40 mb-1">Photo URL</p>
              <a
                href={issue.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex items-center gap-1 break-all"
                style={{ color: "#00c9b1" }}
              >
                {issue.photoUrl}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            data-ocid="database.close_button"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IssuesTab({ issues, loading }: { issues: Issue[]; loading: boolean }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filtered = useMemo(() => {
    return issues.filter((iss) => {
      const matchSearch =
        !search ||
        iss.title.toLowerCase().includes(search.toLowerCase()) ||
        iss.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || iss.status === statusFilter;
      const matchCat =
        categoryFilter === "All" || iss.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [issues, search, statusFilter, categoryFilter]);

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Title",
      "Description",
      "Category",
      "Status",
      "Upvotes",
      "Lat",
      "Lng",
      "Reporter",
      "Created At",
      "Resolved At",
      "Photo URL",
    ];
    const rows = filtered.map((iss) => [
      String(iss.id),
      `"${iss.title.replace(/"/g, '""')}"`,
      `"${iss.description.replace(/"/g, '""')}"`,
      iss.category,
      iss.status,
      String(Number(iss.upvotes)),
      String(iss.lat),
      String(iss.lng),
      iss.reporterId.toString(),
      formatDate(iss.createdAt),
      iss.resolvedAt ? formatDate(iss.resolvedAt) : "",
      iss.photoUrl ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `urbanpulse-issues-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white/80 placeholder:text-white/25 focus-visible:ring-[#FF6B35]/40"
            data-ocid="database.search_input"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-40 bg-white/5 border-white/10 text-white/80"
            data-ocid="database.status.select"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5 text-white/40" />
            <SelectValue placeholder="Status" />
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger
            className="w-44 bg-white/5 border-white/10 text-white/80"
            data-ocid="database.category.select"
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent
            style={{
              background: "#0d1f3c",
              border: "1px solid rgba(0,201,177,0.15)",
            }}
          >
            {CATEGORIES.map((c) => (
              <SelectItem
                key={c}
                value={c}
                className="text-white/80 focus:bg-[#FF6B35]/10 text-xs"
              >
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 text-white font-medium"
          style={{ background: "#FF6B35", border: "none" }}
          data-ocid="database.export.button"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Row count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          Showing{" "}
          <span style={{ color: "#FF6B35" }} className="font-semibold">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="text-white/60 font-semibold">{issues.length}</span>{" "}
          records
        </p>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(0,201,177,0.12)" }}
        data-ocid="database.table"
      >
        {loading ? (
          <div className="p-6 space-y-3" data-ocid="database.loading_state">
            {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
              <Skeleton
                key={k}
                className="h-12 w-full rounded-lg"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="py-16 flex flex-col items-center gap-3"
            data-ocid="database.empty_state"
          >
            <DatabaseIcon className="w-10 h-10 text-white/15" />
            <p className="text-white/40">No records match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "rgba(0,201,177,0.05)",
                    borderBottom: "1px solid rgba(0,201,177,0.1)",
                  }}
                >
                  {[
                    "ID",
                    "Photo",
                    "Title",
                    "Description",
                    "Category",
                    "Status",
                    "Upvotes",
                    "Lat",
                    "Lng",
                    "Reporter",
                    "Created At",
                    "Resolved At",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-3 py-3 text-left text-xs font-semibold text-white/35 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((issue, idx) => (
                  <motion.tr
                    key={String(issue.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => setSelectedIssue(issue)}
                    className="cursor-pointer hover:bg-white/4 transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    data-ocid={`database.item.${idx + 1}`}
                  >
                    <td className="px-3 py-2.5">
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(0,201,177,0.08)",
                          color: "#00c9b1",
                        }}
                      >
                        #{Number(issue.id)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {issue.photoUrl ? (
                        <img
                          src={issue.photoUrl}
                          alt=""
                          className="w-9 h-9 rounded-md object-cover"
                          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-md flex items-center justify-center text-white/15"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        >
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 max-w-[150px]">
                      <p className="text-white/85 font-medium truncate">
                        {issue.title}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 max-w-[180px]">
                      <p className="text-white/50 truncate text-xs">
                        {issue.description}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <CategoryBadge category={issue.category} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#FF6B35" }}
                      >
                        {Number(issue.upvotes)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-white/45 font-mono">
                        {issue.lat.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-white/45 font-mono">
                        {issue.lng.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "#00c9b1" }}
                      >
                        {truncatePrincipal(issue.reporterId)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-white/40 whitespace-nowrap">
                        {formatDate(issue.createdAt)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-white/30 whitespace-nowrap">
                        {issue.resolvedAt ? formatDate(issue.resolvedAt) : "—"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
}

function OverviewTab({
  issues,
  statsLoading,
  issuesLoading,
}: {
  issues: Issue[];
  statsLoading: boolean;
  issuesLoading: boolean;
}) {
  const { data: stats } = useGetAdminStats();

  const statCards = [
    {
      label: "Total Issues",
      value: stats?.totalIssues ?? 0n,
      icon: <BarChart3 className="w-5 h-5" style={{ color: "#FF6B35" }} />,
      bg: "rgba(255,107,53,0.1)",
      color: "#FF6B35",
    },
    {
      label: "Open Issues",
      value: stats?.openIssues ?? 0n,
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      bg: "rgba(239,68,68,0.1)",
      color: "#ef4444",
    },
    {
      label: "In Progress",
      value: stats?.inProgress ?? 0n,
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      bg: "rgba(245,158,11,0.1)",
      color: "#f59e0b",
    },
    {
      label: "Resolved",
      value: stats?.resolved ?? 0n,
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      bg: "rgba(16,185,129,0.1)",
      color: "#10b981",
    },
  ];

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const iss of issues) {
      counts[iss.category] = (counts[iss.category] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [issues]);

  const topUpvoted = useMemo(() => {
    return [...issues]
      .sort((a, b) => Number(b.upvotes) - Number(a.upvotes))
      .slice(0, 5);
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="p-5 rounded-xl flex items-center gap-4"
            style={{
              background: "rgba(13,31,60,0.7)",
              border: "1px solid rgba(0,201,177,0.12)",
              backdropFilter: "blur(12px)",
            }}
            data-ocid="database.stats.card"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: card.bg }}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-white/45 font-medium">{card.label}</p>
              {statsLoading ? (
                <Skeleton
                  className="h-7 w-10 mt-1"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
              ) : (
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: card.color }}
                >
                  {Number(card.value)}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div
          className="p-5 rounded-xl space-y-3"
          style={{
            background: "rgba(13,31,60,0.7)",
            border: "1px solid rgba(0,201,177,0.12)",
          }}
        >
          <h3
            className="font-display font-semibold text-base"
            style={{ color: "#f0e6d3" }}
          >
            Category Breakdown
          </h3>
          {issuesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((k) => (
                <Skeleton
                  key={k}
                  className="h-8 w-full rounded"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              ))}
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <p className="text-white/30 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {categoryBreakdown.map(([cat, count]) => {
                const color = CATEGORY_COLORS[cat] ?? "#6b7280";
                const pct = issues.length
                  ? Math.round((count / issues.length) * 100)
                  : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">{cat}</span>
                      <span className="text-sm font-semibold" style={{ color }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top 5 upvoted */}
        <div
          className="p-5 rounded-xl space-y-3"
          style={{
            background: "rgba(13,31,60,0.7)",
            border: "1px solid rgba(0,201,177,0.12)",
          }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "#FF6B35" }} />
            <h3
              className="font-display font-semibold text-base"
              style={{ color: "#f0e6d3" }}
            >
              Top 5 Most Upvoted
            </h3>
          </div>
          {issuesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((k) => (
                <Skeleton
                  key={k}
                  className="h-10 w-full rounded"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              ))}
            </div>
          ) : topUpvoted.length === 0 ? (
            <p className="text-white/30 text-sm">No issues yet</p>
          ) : (
            <ol className="space-y-2">
              {topUpvoted.map((iss, i) => (
                <li
                  key={String(iss.id)}
                  className="flex items-center gap-3 p-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  data-ocid={`database.top.item.${i + 1}`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background:
                        i === 0
                          ? "rgba(255,107,53,0.25)"
                          : "rgba(255,255,255,0.07)",
                      color: i === 0 ? "#FF6B35" : "#ffffff80",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white/80 font-medium truncate">
                      {iss.title}
                    </p>
                    <p className="text-xs text-white/35">{iss.category}</p>
                  </div>
                  <span
                    className="text-sm font-bold flex-shrink-0"
                    style={{ color: "#FF6B35" }}
                  >
                    ▲ {Number(iss.upvotes)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Database() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: issues = [], isLoading: issuesLoading } = useGetIssues();
  const { isLoading: statsLoading } = useGetAdminStats();

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      navigate({ to: "/login" });
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="database.loading_state"
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(0,201,177,0.15)",
            border: "1px solid rgba(0,201,177,0.3)",
          }}
        >
          <DatabaseIcon className="w-5 h-5" style={{ color: "#00c9b1" }} />
        </div>
        <div>
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "#f0e6d3" }}
          >
            Database Explorer
          </h1>
          <p className="text-sm text-white/45">
            Browse and export all stored data —{" "}
            <span style={{ color: "#00c9b1" }}>{issues.length} records</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="issues">
        <TabsList
          className="mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(0,201,177,0.12)",
          }}
        >
          <TabsTrigger
            value="issues"
            className="data-[state=active]:text-white data-[state=active]:bg-[#FF6B35]/15 text-white/50"
            data-ocid="database.issues.tab"
          >
            Issues Table
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="data-[state=active]:text-white data-[state=active]:bg-[#FF6B35]/15 text-white/50"
            data-ocid="database.overview.tab"
          >
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
          <IssuesTab issues={issues} loading={issuesLoading} />
        </TabsContent>
        <TabsContent value="overview">
          <OverviewTab
            issues={issues}
            statsLoading={statsLoading}
            issuesLoading={issuesLoading}
          />
        </TabsContent>
      </Tabs>

      <footer className="text-center text-xs text-white/25 pt-4">
        &copy; {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/50 transition-colors"
        >
          Built with ♥ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
