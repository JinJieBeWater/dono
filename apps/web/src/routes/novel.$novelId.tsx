import { createFileRoute } from "@tanstack/react-router";
import { NovelSpace } from "@/components/novel-space";

export const Route = createFileRoute("/novel/$novelId")({
  component: NovelComponent,
});

function NovelComponent() {
  const { novelId } = Route.useParams();
  return <NovelSpace novelId={novelId} />;
}
