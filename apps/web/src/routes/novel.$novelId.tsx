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
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";
import { Item } from "@/components/ui/item";

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
  // 移动端一直显示，桌面端根据 open 状态切换
  const shouldShow = isMobile ? true : !open;

  return (
    <header
      className={cn(
        "mt-2 px-1 flex flex-row items-center justify-between w-full h-(--header-height) relative",
        isMobile && "mt-1 py-0.5",
      )}
    >
      <Item
        className={cn(
          "p-0 gap-1 opacity-0 w-fit bg-sidebar outline border-0 transition-opacity mt-2 ring ring-border",
          shouldShow && "opacity-100 duration-200",
          isMobile && "py-0",
        )}
      >
        <ButtonGroup>
          <Button
            className="border-0"
            variant="ghost"
            size={"icon"}
            nativeButton={false}
            render={<Link to="/" />}
          >
            <ArrowLeft />
          </Button>
          <Button className="border-0" variant="ghost" size={"icon"} onClick={toggleSidebar}>
            <PanelLeft />
          </Button>
        </ButtonGroup>
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
