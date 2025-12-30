import { createFileRoute } from "@tanstack/react-router";
import { NovelSpace } from "@/components/novel-space";
import { novelStoreOptions } from "@/stores/novel";
import { StoreLoading } from "@/components/loader";

export const Route = createFileRoute("/novel/$novelId")({
  component: NovelComponent,
  preload: true,
  pendingComponent: () => <StoreLoading title="Opening your novel..." />,
  loader: ({ context, params: { novelId } }) => {
    context.storeRegistry.preload(novelStoreOptions(novelId));
  },
});

function NovelComponent() {
  const { novelId } = Route.useParams();
  return <NovelSpace novelId={novelId} />;
}
