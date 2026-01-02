import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/novel")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
