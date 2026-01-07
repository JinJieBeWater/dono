import { createFileRoute } from "@tanstack/react-router";
import { UserSpace } from "@/components/user-space";
import { userStoreOptions } from "@/stores/user";
import { StoreLoading } from "@/components/loader";
import Header from "@/components/header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  pendingComponent: () => <StoreLoading title="Opening your space..." />,
  loader: ({ context }) => {
    context.storeRegistry.preload(userStoreOptions());
  },
});

function HomeComponent() {
  return (
    <div
      className={cn(
        "h-svh mx-auto px-2 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20 scrollbar-hover:scrollbar-thumb-primary",
      )}
    >
      <Header />
      <UserSpace />
    </div>
  );
}
