import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import Admin from "./pages/Admin";
import AuthPage from "./pages/AuthPage";
import Database from "./pages/Database";
import Feed from "./pages/Feed";
import LandingPage from "./pages/LandingPage";
import MapView from "./pages/MapView";
import ReportIssue from "./pages/ReportIssue";

// Root route — no component, just outlet
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Landing page route — standalone, no Layout
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

// App root route — wraps all inner pages with Layout
const appRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: () => (
    <>
      <Layout />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(22,28,39,0.96)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e5e7eb",
          },
        }}
      />
    </>
  ),
});

const mapRoute = createRoute({
  getParentRoute: () => appRootRoute,
  path: "/map",
  component: MapView,
});

const feedRoute = createRoute({
  getParentRoute: () => appRootRoute,
  path: "/feed",
  component: Feed,
});

const reportRoute = createRoute({
  getParentRoute: () => appRootRoute,
  path: "/report",
  component: ReportIssue,
});

const adminRoute = createRoute({
  getParentRoute: () => appRootRoute,
  path: "/admin",
  component: Admin,
});

const databaseRoute = createRoute({
  getParentRoute: () => appRootRoute,
  path: "/database",
  component: Database,
});

const loginRoute = createRoute({
  getParentRoute: () => appRootRoute,
  path: "/login",
  component: AuthPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  appRootRoute.addChildren([
    mapRoute,
    feedRoute,
    reportRoute,
    adminRoute,
    databaseRoute,
    loginRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

export { redirect };
