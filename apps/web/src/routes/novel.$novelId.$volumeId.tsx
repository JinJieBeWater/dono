import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/novel/$novelId/$volumeId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/novel/$novelId/$volumeId"!</div>;
}
