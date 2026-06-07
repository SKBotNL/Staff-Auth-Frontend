import type { RouteDefinition } from "@solidjs/router";
import { lazy } from "solid-js";

import AppLayout from "./components/AppLayout";
import BasicLayout from "./components/BasicLayout";
import { preloadInvites } from "./pages/panel/invites.data";
// import { preloadUser } from "./pages/user/user.data";
import { preloadUsers } from "./pages/panel/user/users.data";

const Login = lazy(() => import("./pages/login"));
const Consent = lazy(() => import("./pages/consent"));

const Setup = lazy(() => import("./pages/setup"));

import ResetAccount from "./pages/resetAccount";

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: (props) => <AppLayout>{props.children}</AppLayout>,
    children: [
      {
        path: "/",
        component: lazy(() => import("./pages/panel/home")),
      },
      {
        path: "/users",
        component: lazy(() => import("./pages/panel/user/users")),
        preload: () => preloadUsers,
      },
      // {
      //   path: "/user/:id",
      //   component: lazy(() => import("./pages/user/user")),
      //   preload: () => preloadUser,
      // },
      {
        path: "/invites",
        component: lazy(() => import("./pages/panel/invites")),
        preload: () => preloadInvites,
      },
    ],
  },
  {
    path: "/login",
    component: () => (
      <BasicLayout>
        <Login />
      </BasicLayout>
    ),
  },
  {
    path: "/consent",
    component: () => (
      <BasicLayout>
        <Consent />
      </BasicLayout>
    ),
  },
  {
    path: "/setup",
    component: () => (
      <BasicLayout>
        <Setup />
      </BasicLayout>
    ),
  },
  {
    path: "/reset-account",
    component: () => (
      <BasicLayout>
        <ResetAccount />
      </BasicLayout>
    ),
  },
  {
    path: "/successful-setup",
    component: lazy(() => import("./pages/successfulSetup")),
  },
  {
    path: "/logged-out",
    component: lazy(() => import("./pages/loggedOut")),
  },
  {
    path: "**",
    component: lazy(() => import("./errors/404")),
  },
];
