import type { QueryClient } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { orpc } from "@/utils/orpc";

import "../index.css";
import { StoreRegistry } from "@livestore/livestore";
import { StoreRegistryProvider } from "@livestore/react";
import { getLocalUserInfo } from "@/utils/get-local-user-info";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  storeRegistry: StoreRegistry;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
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
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            <Outlet />
          </div>
        </StoreRegistryProvider>
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
