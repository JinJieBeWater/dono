import { useUserStore } from "@/stores/user";
import { novel$, type Novel } from "@dono/stores/user";

export function NovelGuard({
  novelId,
  children,
}: {
  novelId: string;
  children: (novel: Novel) => React.ReactNode;
}) {
  const userStore = useUserStore();
  const novel = userStore.useQuery(novel$({ novelId }));

  if (!novel) return null;
  return <>{children(novel)}</>;
}
