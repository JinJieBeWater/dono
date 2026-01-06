import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { unstable_batchedUpdates as batchUpdates } from "react-dom";

import { StoreLoading } from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { orpc, queryClient } from "./utils/orpc";
import { StoreRegistry } from "@livestore/livestore";
import { ConnectionProvider, useConnection } from "./hooks/use-connection";

const storeRegistry = new StoreRegistry({
  defaultOptions: {
    batchUpdates,
    debug: {
      instanceId: "Tpb0Nb1lkG",
    },
  },
});

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreload: "intent",
  defaultPendingComponent: () => <StoreLoading />,
  context: {
    storeRegistry,
    orpc,
    queryClient,
    connection: undefined!,
  },
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

function App() {
  return (
    <ConnectionProvider>
      <Router />
    </ConnectionProvider>
  );
}

function Router() {
  const connection = useConnection();
  return (
    <RouterProvider
      router={router}
      context={{
        connection,
      }}
    />
  );
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
