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
        "grid grid-rows-[auto_1fr] h-svh mx-auto transition-all duration-200 ease-linear",
        "max-w-180",
      )}
    >
      <Header />
      <UserSpace />
    </div>
  );
}
