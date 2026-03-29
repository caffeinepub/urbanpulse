import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Type {
    principal: Principal;
    name: string;
    role: Type__1;
}
export interface Type__3 {
    lat: number;
    lng: number;
    weight: bigint;
}
export interface Type__4 {
    resolved: bigint;
    totalIssues: bigint;
    openIssues: bigint;
    inProgress: bigint;
}
export interface Type__2 {
    id: bigint;
    lat: number;
    lng: number;
    upvotes: bigint;
    status: string;
    title: string;
    createdAt: bigint;
    description: string;
    photoUrl?: string;
    reporterId: Principal;
    category: string;
    resolvedAt?: bigint;
}
export enum Type__1 {
    User = "User",
    Admin = "Admin"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    resetAdminAccess(userSecret: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createIssue(title: string, description: string, category: string, photoUrl: string | null, lat: number, lng: number): Promise<bigint>;
    deleteIssue(id: bigint): Promise<boolean>;
    getAdminStats(): Promise<Type__4>;
    getCallerUserRole(): Promise<UserRole>;
    getHeatmapData(): Promise<Array<Type__3>>;
    getIssueCount(): Promise<bigint>;
    getIssues(): Promise<Array<Type__2>>;
    getIssuesByCategory(category: string): Promise<Array<Type__2>>;
    getIssuesByReporter(reporter: Principal): Promise<Array<Type__2>>;
    getIssuesByStatus(status: string): Promise<Array<Type__2>>;
    getMyProfile(): Promise<Type | null>;
    getOrCreateProfile(name: string): Promise<Type>;
    isCallerAdmin(): Promise<boolean>;
    updateIssueStatus(id: bigint, status: string): Promise<boolean>;
    upvoteIssue(id: bigint): Promise<boolean>;
}
