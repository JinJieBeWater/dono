import { useIsMobile } from "@/hooks/use-mobile";
import { PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { Item } from "./ui/item";
import { Button } from "./ui/button";
import { useOutline } from "@/hooks/use-outline";

export const NovelMobileBar = ({ className, ...props }: React.ComponentProps<"div">) => {
  const { toggleSidebar, openMobile } = useSidebar();
  const { isOutlineOpen, setIsOutlineOpen } = useOutline();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <div></div>;
  }

  return (
    <Item variant={"default"} size={"xs"} className={cn("justify-between", className)} {...props}>
      <Button variant="outline" size="sm" onClick={toggleSidebar}>
        {openMobile ? <PanelLeftClose /> : <PanelLeft />}
        Catalogue
      </Button>
      <Button variant="outline" onClick={() => setIsOutlineOpen(!isOutlineOpen)}>
        {isOutlineOpen ? <PanelRightClose /> : <PanelRight />}
        Outline
      </Button>
    </Item>
  );
};
