import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Type__4 as AdminStats, Type__2 as Issue } from "../backend.d";
import { useActor } from "./useActor";

export type { Issue, AdminStats };

export function useGetIssues() {
  const { actor, isFetching } = useActor();
  return useQuery<Issue[]>({
    queryKey: ["issues"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIssues();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpvoteIssue() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.upvoteIssue(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
    },
  });
}

export function useCreateIssue() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      category: string;
      photoUrl: string | null;
      lat: number;
      lng: number;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createIssue(
        params.title,
        params.description,
        params.category,
        params.photoUrl,
        params.lat,
        params.lng,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useUpdateIssueStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateIssueStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useDeleteIssue() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteIssue(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}
