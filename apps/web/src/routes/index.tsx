import { createFileRoute } from "@tanstack/react-router";
import { UserSpace } from "@/components/user-space";
import { userStoreOptions } from "@/stores/user";
import { StoreLoading } from "@/components/loader";
import Header from "@/components/header";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  pendingComponent: () => <StoreLoading title="Opening your space..." />,
  loader: ({ context }) => {
    context.storeRegistry.preload(userStoreOptions());
  },
});

function HomeComponent() {
  return (
    <div className="grid grid-rows-[auto_1fr] h-svh">
      <Header />
      <UserSpace />;
    </div>
  );
}
