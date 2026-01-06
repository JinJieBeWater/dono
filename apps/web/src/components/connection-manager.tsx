import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Wifi, WifiOff, Loader2, CloudOff } from "lucide-react";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import { useConnection } from "@/hooks/use-connection";
/**
 * ConnectionManager 组件
 * 使用 shadcn UI 风格显示当前连接状态
 */
export default function ConnectionManager({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const connection = useConnection();

  // 根据连接状态返回对应的图标和样式配置
  const getStatusConfig = () => {
    switch (connection.state) {
      case "offline":
        return {
          icon: WifiOff,
          iconClass: "text-muted-foreground",
        };
      case "connecting":
        return {
          icon: Loader2,
          iconClass: "text-primary animate-spin",
        };
      case "connected":
        return {
          icon: Wifi,
          iconClass: "text-primary",
        };
      case "local_only":
        return {
          icon: CloudOff,
          iconClass: "text-primary",
        };
      default:
        throw shouldNeverHappen("Unknown connection state");
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={cn("border-0", className)}
            {...props}
          ></Button>
        }
      >
        <output className="inline-flex items-center" aria-live="polite">
          {/* 连接状态图标 */}
          <Icon
            className={cn("size-4 transition-all duration-300", config.iconClass)}
            aria-hidden="true"
          />
        </output>
      </TooltipTrigger>

      <TooltipContent side="bottom">
        <p className="text-xs">{connection.getStatusMessage()}</p>
      </TooltipContent>
    </Tooltip>
  );
}
