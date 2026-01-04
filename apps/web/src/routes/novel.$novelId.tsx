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
import { Item, ItemActions } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";

export const Route = createFileRoute("/novel/$novelId")({
  component: RouteComponent,
  preload: true,
  pendingComponent: () => <StoreLoading title="Opening your novel..." />,
  loader: ({ context, params: { novelId } }) => {
    context.storeRegistry.preload(novelStoreOptions(novelId));
  },
});

function Header() {
  const { open, isMobile, toggleSidebar } = useSidebar();
  // const novelId = useParams({
  //   from: "/novel/$novelId",
  //   select: (params) => params.novelId,
  // });
  // const userStore = useUserStore();
  // const novel = userStore.useQuery(novel$({ novelId }));

  // 移动端一直显示，桌面端根据 open 状态切换
  const shouldShow = isMobile ? true : !open;

  return (
    <header
      className={cn(
        "mt-2 px-1 flex flex-row items-center justify-between py-1 w-full h-(--header-height)",
        isMobile && "mt-1 py-0.5",
      )}
    >
      <Item
        variant="outline"
        size="sm"
        className={cn(
          "py-0.5 px-1 gap-1 opacity-0 w-fit",
          shouldShow && "opacity-100",
          isMobile && "py-0",
        )}
      >
        <ItemActions>
          <ButtonGroup>
            <Button variant="ghost" size={"icon"} nativeButton={false} render={<Link to="/" />}>
              <ArrowLeft />
            </Button>
            <Button variant="ghost" size={"icon"} onClick={toggleSidebar}>
              <PanelLeft />
            </Button>
          </ButtonGroup>
        </ItemActions>
        {/* <Link
          className="px-1 py-1 focus:underline h-full hover:underline font-medium"
          to="/novel/$novelId"
          params={{
            novelId: novel.id,
          }}
          aria-label="home"
        >
          <h1 className="line-clamp-1 text-sm">{novel.title}</h1>
        </Link> */}
      </Item>
      <hr />
    </header>
  );
}

function RouteComponent() {
  const novelId = Route.useParams({
    select: (params) => params.novelId,
  });
  const userStore = useUserStore();

  useEffect(() => {
    userStore.commit(userEvents.uiStateSet({ lastAccessedNovelId: novelId }));
  }, [novelId]);

  return (
    <SidebarProvider className="flex flex-col">
      <OutlineProvider>
        <div className="flex flex-1 overflow-hidden">
          <NovelSidebar variant="floating" />
          <SidebarInset>
            <div className="h-full grid grid-rows-[auto_1fr] px-1 pr-2">
              <Header />
              <div className="h-full w-full overflow-auto">
                <Outlet />
              </div>
            </div>
          </SidebarInset>
        </div>
      </OutlineProvider>
    </SidebarProvider>
  );
}
