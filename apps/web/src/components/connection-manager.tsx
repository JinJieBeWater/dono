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
  // Reason: 使用响应式版本的 useConnection，当状态改变时组件会重新渲染
  const { state, check } = useConnection();

  // 根据连接状态返回对应的图标和样式配置
  const getStatusConfig = () => {
    switch (state) {
      case "offline":
        return {
          icon: WifiOff,
          iconClass: "text-muted-foreground",
          message: "Offline",
        };
      case "connecting":
        return {
          icon: Loader2,
          iconClass: "text-primary animate-spin",
          message: "Connecting",
        };
      case "connected":
        return {
          icon: Wifi,
          iconClass: "text-primary",
          message: "Online",
        };
      case "local_only":
        return {
          icon: CloudOff,
          iconClass: "text-primary",
          message: "Local",
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
            onClick={() => check()}
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
        <p className="text-xs">{config.message}</p>
      </TooltipContent>
    </Tooltip>
  );
}
