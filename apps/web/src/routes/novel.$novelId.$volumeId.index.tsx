import { OutlineEditArea } from "@/components/outline-edit-area";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/novel/$novelId/$volumeId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <OutlineEditArea />;
}
