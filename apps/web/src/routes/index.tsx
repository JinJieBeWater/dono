import { createFileRoute } from "@tanstack/react-router";
import { UserSpace } from "@/components/user-space";
import { userStoreOptions } from "@/stores/user";
import { StoreLoading } from "@/components/loader";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  pendingComponent: StoreLoading,
  loader: ({ context }) => {
    context.storeRegistry.preload(userStoreOptions());
  },
});

function HomeComponent() {
  return <UserSpace />;
}
