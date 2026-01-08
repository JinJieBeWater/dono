import { useSidebar } from "@/components/ui/sidebar";
import { Link, useMatchRoute, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";
import { Item } from "@/components/ui/item";
import { SystemCapsule } from "./system-capsule";
import { CatalogueQuickJump } from "./catalogue-quick-jump";

export function NovelHeader() {
  const { open, isMobile, toggleSidebar } = useSidebar();
  const match = useMatchRoute();
  const isNovelHomePage = !!match({ to: "/novel/$novelId" });
  const novelId = useParams({
    from: "/novel/$novelId",
    select: (params) => params.novelId,
  });
  // 移动端一直显示，桌面端根据 open 状态切换
  const shouldShow = isMobile ? true : !open;

  const shouldShowBackHomeButton = !isNovelHomePage;
  return (
    <header
      className={cn(
        "px-1 mt-2 flex justify-between w-full h-(--header-height) gap-4 sticky top-4 z-10 right-0",
        isMobile && "mt-4 px-3",
      )}
    >
      <div className="flex gap-2">
        <Item
          variant={"outline"}
          className={cn(
            "p-0 opacity-0 w-fit transition-opacity bg-sidebar",
            !shouldShow && "hidden",
            shouldShow && "opacity-100 duration-200",
          )}
        >
          <ButtonGroup>
            {shouldShowBackHomeButton ? (
              <Button
                className="border-0 bg-inherit"
                variant="outline"
                size={"icon"}
                nativeButton={false}
                render={<Link to="/novel/$novelId" params={{ novelId }} />}
              >
                <Home />
              </Button>
            ) : (
              <Button
                className="border-0 bg-inherit"
                variant="outline"
                size={"icon"}
                nativeButton={false}
                render={<Link to="/" />}
              >
                <ArrowLeft />
              </Button>
            )}
            <Button
              className="border-0 bg-inherit"
              variant="outline"
              size={"icon"}
              onClick={toggleSidebar}
            >
              <PanelLeft />
            </Button>
          </ButtonGroup>
        </Item>
        <CatalogueQuickJump />
      </div>
      <SystemCapsule className="bg-sidebar" />
    </header>
  );
}
