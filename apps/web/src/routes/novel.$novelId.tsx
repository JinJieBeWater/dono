import { StoreLoading } from "@/components/loader";
import { NovelSidebar } from "@/components/novel-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OutlineProvider } from "@/hooks/use-outline";
import { novelStoreOptions } from "@/stores/novel";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { userEvents, useUserStore } from "@/stores/user";
import { useEffect } from "react";
import { NovelHeader } from "@/components/novel-header";
import { CatalogueTreeProvider } from "@/hooks/use-catalogue-tree";
import { CreateVolumeDialog } from "@/components/dialogs/create-volume-dialog";

export const Route = createFileRoute("/novel/$novelId")({
  component: RouteComponent,
  preload: true,
  pendingComponent: () => <StoreLoading title="Opening your novel..." />,
  loader: ({ context, params: { novelId } }) => {
    context.storeRegistry.preload(novelStoreOptions(novelId));
  },
});

function RouteComponent() {
  const novelId = Route.useParams({
    select: (params) => params.novelId,
  });
  const userStore = useUserStore();

  useEffect(() => {
    userStore.commit(userEvents.uiStateSet({ lastAccessedNovelId: novelId }));
  }, [novelId]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 8.5)",
        } as React.CSSProperties
      }
    >
      <CatalogueTreeProvider>
        <OutlineProvider>
          <NovelSidebar variant="floating" />
          <SidebarInset>
            <div className="pl-2 pr-2 h-full">
              <NovelHeader />
              <Outlet />
              <CreateVolumeDialog />
            </div>
          </SidebarInset>
        </OutlineProvider>
      </CatalogueTreeProvider>
    </SidebarProvider>
  );
}
