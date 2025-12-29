import { createFileRoute } from "@tanstack/react-router";
import { UserSpace } from "@/components/user-space";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <UserSpace />;
}
