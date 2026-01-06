import { useSidebar } from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";
import { Item } from "@/components/ui/item";
import { SystemCapsule } from "./system-capsule";

export function NovelHeader() {
  const { open, isMobile, toggleSidebar } = useSidebar();
  // 移动端一直显示，桌面端根据 open 状态切换
  const shouldShow = isMobile ? true : !open;

  return (
    <header
      className={cn(
        "px-1 mt-2 flex justify-between w-full h-(--header-height) relative gap-4 ",
        isMobile && "mt-4 px-3",
      )}
    >
      <Item
        variant={"outline"}
        className={cn(
          "p-0 gap-1 opacity-0 w-fit transition-opacity",
          shouldShow && "opacity-100 duration-200",
          isMobile && "py-0",
        )}
      >
        <ButtonGroup>
          <Button
            className="border-0 bg-inherit"
            variant="outline"
            size={"icon"}
            nativeButton={false}
            render={<Link to="/" />}
          >
            <ArrowLeft />
          </Button>
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
      <SystemCapsule />
    </header>
  );
}
