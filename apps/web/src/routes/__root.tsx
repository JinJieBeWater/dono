import type { QueryClient } from "@tanstack/react-query";

import { HeadContent, Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { orpc } from "@/utils/orpc";

import "../index.css";
import { StoreRegistry } from "@livestore/livestore";
import { StoreRegistryProvider } from "@livestore/react";
import { getLocalUserInfo } from "@/utils/get-local-user-info";
import { userStoreOptions } from "@/stores/user";
import { StoreLoading } from "@/components/loader";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  storeRegistry: StoreRegistry;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  pendingComponent: () => <StoreLoading />,

  head: () => ({
    meta: [
      {
        title: "dono",
      },
      {
        name: "description",
        content: "dono is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const localUserInfo = getLocalUserInfo();
    if (localUserInfo) {
      return { localUserInfo };
    }

    if (location.pathname !== "/login") {
      redirect({
        to: "/login",
        throw: true,
      });
    }
  },
  loader: ({ context, location }) => {
    if (location.pathname === "/login") {
      return;
    }
    context.storeRegistry.preload(userStoreOptions());
  },
});

function RootComponent() {
  const { storeRegistry } = Route.useRouteContext();

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <StoreRegistryProvider storeRegistry={storeRegistry}>
          <div className="h-svh">
            <Outlet />
          </div>
        </StoreRegistryProvider>
        <Toaster richColors />
      </ThemeProvider>
      {/* <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" /> */}
    </>
  );
}
