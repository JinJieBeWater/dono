import { createFileRoute } from "@tanstack/react-router";
import { UserSpace } from "@/components/user-space";
import { userStoreOptions } from "@/stores/user";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: ({ context }) => {
    context.storeRegistry.preload(userStoreOptions());
  },
});

function HomeComponent() {
  return <UserSpace />;
}
