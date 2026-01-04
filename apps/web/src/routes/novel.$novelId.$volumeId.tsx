import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/novel/$novelId/$volumeId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
