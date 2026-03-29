import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, MapPin, SortAsc, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetIssues, useUpvoteIssue } from "../hooks/useQueries";
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
const SORTS = ["Recent", "Most Upvoted"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  StreetLight: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Trash: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  RoadDamage: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Water: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  StreetLight: "Street Light",
  Trash: "Trash/Waste",
  RoadDamage: "Road Damage",
  Water: "Water/Drain",
  Other: "Other",
};

function StatusPill({ status }: { status: string }) {
  let cls = "";
  let label = status;
  if (status === "Open") cls = "status-open";
  else if (status === "InProgress") {
    cls = "status-inprogress";
    label = "In Progress";
  } else cls = "status-resolved";
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function IssueCard({ issue, index }: { issue: Issue; index: number }) {
  const { identity } = useInternetIdentity();
  const upvote = useUpvoteIssue();

  const handleUpvote = async () => {
    if (!identity) {
      toast.error("Please login to upvote issues");
      return;
    }
    try {
      await upvote.mutateAsync(issue.id);
      toast.success("Upvote registered!");
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const createdDate = new Date(
    Number(issue.createdAt) / 1_000_000,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const catClass = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS.Other;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "rgba(0,201,177,0.2)" }}
      data-ocid={`feed.item.${index + 1}`}
    >
      {issue.photoUrl && (
        <div className="h-40 overflow-hidden">
          <img
            src={issue.photoUrl}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${catClass}`}
              >
                {CATEGORY_LABELS[issue.category] || issue.category}
              </span>
              <StatusPill status={issue.status} />
            </div>
            <h3
              className="font-display font-bold text-base leading-snug line-clamp-2"
              style={{ color: "#f0e6d3" }}
            >
              {issue.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-white/55 leading-relaxed line-clamp-2">
          {issue.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {issue.lat.toFixed(3)}, {issue.lng.toFixed(3)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {createdDate}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUpvote}
            disabled={upvote.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 transition-all duration-200 text-sm font-medium disabled:opacity-50 hover:bg-[#FF6B35]/15 hover:border-[#FF6B35]/30 hover:text-[#FF6B35]"
            data-ocid={`feed.upvote.${index + 1}`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            {Number(issue.upvotes)}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-4 space-y-3" data-ocid="feed.loading_state">
      <div className="flex gap-2">
        <Skeleton
          className="h-5 w-24 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <Skeleton
          className="h-5 w-16 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
      </div>
      <Skeleton
        className="h-5 w-3/4"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <Skeleton
        className="h-4 w-full"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <Skeleton
        className="h-4 w-2/3"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div className="flex justify-between pt-1">
        <Skeleton
          className="h-4 w-32"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <Skeleton
          className="h-7 w-16 rounded-lg"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
      </div>
    </div>
  );
}

export default function Feed() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState<"Recent" | "Most Upvoted">("Recent");
  const { data: issues, isLoading } = useGetIssues();

  const filtered = useMemo(() => {
    let arr = issues ?? [];
    if (categoryFilter !== "All")
      arr = arr.filter((i) => i.category === categoryFilter);
    if (statusFilter !== "All")
      arr = arr.filter((i) => i.status === statusFilter);
    if (sort === "Recent")
      arr = [...arr].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    else arr = [...arr].sort((a, b) => Number(b.upvotes) - Number(a.upvotes));
    return arr;
  }, [issues, categoryFilter, statusFilter, sort]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1
          className="font-display text-2xl font-bold"
          style={{ color: "#f0e6d3" }}
        >
          Issue Feed
        </h1>
        <p className="text-sm text-white/50">
          Browse and upvote reported city issues
        </p>
      </div>

      <div className="space-y-3" data-ocid="feed.panel">
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-white/40" />
          <div className="flex gap-1">
            {SORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  sort === s
                    ? "border"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
                style={
                  sort === s
                    ? {
                        background: "rgba(255,107,53,0.2)",
                        color: "#FF6B35",
                        borderColor: "rgba(255,107,53,0.3)",
                      }
                    : {}
                }
                data-ocid="feed.sort.tab"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                categoryFilter === cat
                  ? "border"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
              }`}
              style={
                categoryFilter === cat
                  ? {
                      background: "rgba(255,107,53,0.2)",
                      color: "#FF6B35",
                      borderColor: "rgba(255,107,53,0.4)",
                    }
                  : {}
              }
              data-ocid="feed.category.tab"
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                statusFilter === st
                  ? "border"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
              }`}
              style={
                statusFilter === st
                  ? {
                      background: "rgba(255,107,53,0.2)",
                      color: "#FF6B35",
                      borderColor: "rgba(255,107,53,0.4)",
                    }
                  : {}
              }
              data-ocid="feed.status.tab"
            >
              {st === "InProgress" ? "In Progress" : st}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          ["a", "b", "c", "d"].map((k) => <SkeletonCard key={k} />)
        ) : filtered.length === 0 ? (
          <div
            className="glass-card p-12 flex flex-col items-center gap-3 text-center"
            data-ocid="feed.empty_state"
          >
            <AlertCircle className="w-10 h-10 text-white/20" />
            <p className="font-display font-semibold text-white/60">
              No issues found
            </p>
            <p className="text-sm text-white/35">
              {categoryFilter !== "All" || statusFilter !== "All"
                ? "Try clearing some filters"
                : "Be the first to report an issue in your area!"}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((issue, i) => (
              <IssueCard key={String(issue.id)} issue={issue} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
