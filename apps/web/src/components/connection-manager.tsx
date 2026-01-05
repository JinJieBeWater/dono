import { useConnection } from "@/hooks/use-connection";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

/**
 * ConnectionManager 组件
 * 使用 shadcn UI 风格显示当前连接状态
 */
export default function ConnectionManager() {
  const { connectionState } = useConnection();

  // 根据连接状态返回对应的样式配置
  const getStatusConfig = () => {
    switch (connectionState) {
      case "offline":
        return {
          dotClass: "bg-muted-foreground border-2 border-background",
          textClass: "text-muted-foreground",
          tooltip: "Device offline. All changes are saved locally only.",
        };
      case "connecting":
        return {
          dotClass: "bg-primary animate-pulse",
          textClass: "text-muted-foreground",
          tooltip: "Connecting to server...",
        };
      case "connected":
        return {
          dotClass: "bg-primary",
          textClass: "text-foreground",
          tooltip: "Connected to server. Changes will sync automatically.",
        };
      case "local_only":
        return {
          dotClass: "bg-destructive",
          textClass: "text-destructive",
          tooltip: "Cannot connect to server, retrying. Currently in local-only mode.",
        };
      default:
        return {
          dotClass: "bg-muted",
          textClass: "text-muted-foreground",
          tooltip: "Unknown connection state",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon"></Button>}>
        <output className="inline-flex items-center" aria-live="polite">
          {/* 状态指示点 */}
          <span
            className={cn("size-2 rounded-full transition-all duration-300", config.dotClass)}
            aria-hidden="true"
          />
        </output>
      </TooltipTrigger>

      <TooltipContent side="bottom">
        <p className="text-xs">{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
