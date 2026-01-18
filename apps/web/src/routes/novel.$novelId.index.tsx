import { createFileRoute, useParams } from "@tanstack/react-router";

import { NovelGuard } from "@/components/novel-guard";
import { NoveHome } from "@/components/nove-home";

export const Route = createFileRoute("/novel/$novelId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { novelId } = useParams({ from: "/novel/$novelId/" });

  return (
    <NovelGuard novelId={novelId}>
      {(novel) => <NoveHome novelId={novelId} novel={novel} />}
    </NovelGuard>
  );
}
