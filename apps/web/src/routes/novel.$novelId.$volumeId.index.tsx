import { OutlineEditArea } from "@/components/outline-edit-area";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/novel/$novelId/$volumeId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-3 pt-3 w-full">
      <OutlineEditArea />
    </div>
  );
}
