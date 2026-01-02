import { StoreLoading } from "@/components/loader";
import { NovelSidebar } from "@/components/novel-sidebar";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { OutlineProvider } from "@/hooks/use-outline";
import { novelStoreOptions } from "@/stores/novel";
import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { userEvents, useUserStore } from "@/stores/user";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PanelLeft } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";

export const Route = createFileRoute("/novel/$novelId")({
  component: RouteComponent,
  preload: true,
  pendingComponent: () => <StoreLoading title="Opening your novel..." />,
  loader: ({ context, params: { novelId } }) => {
    context.storeRegistry.preload(novelStoreOptions(novelId));
  },
});

// 浮动胶囊按钮组件，在 sidebar 隐藏时显示
function Header() {
  const { open, isMobile, openMobile, toggleSidebar } = useSidebar();

  // 只在 sidebar 隐藏时显示（桌面端收缩或移动端关闭）
  const shouldShow = isMobile ? !openMobile : !open;

  return (
    <header className="flex flex-row items-center justify-between px-2 py-1 bg-sidebar">
      {shouldShow && (
        <ButtonGroup orientation="horizontal">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/" />}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleSidebar}>
            <PanelLeft />
          </Button>
        </ButtonGroup>
      )}
      <hr />
    </header>
  );
}
// [--header-height:calc(--spacing(0))]
function RouteComponent() {
  const { novelId } = Route.useParams();
  const userStore = useUserStore();
  useEffect(() => {
    userStore.commit(userEvents.uiStateSet({ lastAccessedNovelId: novelId }));
  }, [novelId]);
  return (
    <div className="">
      <SidebarProvider className="flex flex-col">
        <OutlineProvider>
          <div className="flex flex-1 overflow-hidden">
            <NovelSidebar variant="floating" />
            <SidebarInset>
              <div className="h-full grid grid-rows-[auto_1fr]">
                <Header />
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
