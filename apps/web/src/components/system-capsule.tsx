import { cn } from "@/lib/utils";
import ConnectionManager from "./connection-manager";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { ButtonGroup } from "./ui/button-group";
import UserMenu from "./user-menu";
import { Item } from "./ui/item";

export function SystemCapsule({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Item variant={"outline"} className={cn("p-0 gap-1 w-fit", className)} {...props}>
      <ButtonGroup>
        <AnimatedThemeToggler className="bg-inherit" />
        <UserMenu className="bg-inherit" />
        <ConnectionManager className="bg-inherit" />
      </ButtonGroup>
    </Item>
  );
}
