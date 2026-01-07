import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/novel/$novelId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="px-3 pt-3 w-full">In development</div>;
}
