import { StoreLoading } from "@/components/loader";
import { NovelMobileBar } from "@/components/novel-mobile-bar";
import { NovelSidebar } from "@/components/novel-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OutlineProvider } from "@/hooks/use-outline";
import { novelStoreOptions } from "@/stores/novel";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { userEvents, useUserStore } from "@/stores/user";
import { useEffect } from "react";

export const Route = createFileRoute("/novel/$novelId")({
  component: RouteComponent,
  preload: true,
  pendingComponent: () => <StoreLoading title="Opening your novel..." />,
  loader: ({ context, params: { novelId } }) => {
    context.storeRegistry.preload(novelStoreOptions(novelId));
  },
});

function RouteComponent() {
  const { novelId } = Route.useParams();
  const userStore = useUserStore();
  useEffect(() => {
    userStore.commit(userEvents.uiStateSet({ lastAccessedNovelId: novelId }));
  }, [novelId]);
  return (
    <div className="[--header-height:calc(--spacing(0))]">
      <SidebarProvider className="flex flex-col">
        <OutlineProvider>
          <div className="flex flex-1 overflow-hidden">
            <NovelSidebar variant="floating" />
            <SidebarInset>
              <div className="h-full grid grid-rows-[auto_1fr]">
                <NovelMobileBar />
                <div className="h-full w-full overflow-auto">
                  <Outlet />
                </div>
              </div>
            </SidebarInset>
          </div>
        </OutlineProvider>
      </SidebarProvider>
    </div>
  );
}
