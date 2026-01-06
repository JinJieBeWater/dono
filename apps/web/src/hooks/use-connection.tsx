import { useNetwork } from "@/hooks/use-network";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * 连接状态类型
 */
export type ConnectionState = "connecting" | "connected" | "local_only" | "offline";

/**
 * Connection context 值类型
 */
interface ConnectionContextValue {
  /** 当前连接状态 */
  state: ConnectionState;
  /** 手动触发连接检查 */
  check: () => Promise<void>;
  /** 获取状态消息 */
  getStatusMessage: () => string;
}

const ConnectionContext = createContext<ConnectionContextValue | undefined>(undefined);

/**
 * ConnectionProvider 组件
 * 管理应用的连接状态和同步逻辑
 */
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const { online: isOnline } = useNetwork();

  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkConnectionRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const scheduleRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    // 渐进式退避策略: 1s, 2s, 4s, ... 最大 64s
    const delay = Math.min(1000 * 2 ** retryCount, 64 * 1000);

    console.log(`Scheduling connection retry in ${delay / 1000} seconds`);

    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      checkConnectionRef.current?.();
    }, delay);
  }, [retryCount]);

  const checkConnection = useCallback(async () => {
    if (!isOnline) {
      setConnectionState("offline");
      return;
    }

    try {
      setConnectionState("connecting");

      // 获取凭证并尝试建立连接
      const credentials = await authClient.getSession();
      if (!credentials) {
        setConnectionState("local_only");
        console.log("No credentials found, working in local-only mode");
        return;
      }

      // 检查服务端是否可用
      const result = await queryClient.fetchQuery(orpc.healthCheck.queryOptions());

      // 服务端正常
      if (result) {
        setConnectionState("connected");
        setRetryCount(0);
      } else {
        console.error("Failed to connect to remote database:");
        setConnectionState("local_only");
        scheduleRetry();
      }
    } catch (error) {
      // 服务不可用 可能是服务器或网络问题
      console.error("Connection check failed:", error);
      setConnectionState("local_only");
      scheduleRetry();
    }
  }, [isOnline, scheduleRetry]);

  // 保持 ref 与最新的 checkConnection 同步
  useEffect(() => {
    checkConnectionRef.current = checkConnection;
  }, [checkConnection]);

  // 初始化时检查连接
  useEffect(() => {
    checkConnection();

    // 组件卸载时清理待处理的重试
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [checkConnection]);

  // 监听连接状态变化
  useEffect(() => {
    if (isOnline && connectionState === "connected") {
      console.log("Connection established, syncing data...");
    } else if (!isOnline) {
      console.log("Device offline, working locally...");
    }
  }, [isOnline, connectionState]);

  const getStatusMessage = useCallback((): string => {
    switch (connectionState) {
      case "offline":
        return "Offline ";
      case "connecting":
        return "Connecting";
      case "connected":
        return "Online";
      case "local_only":
        return "retrying";
      default:
        return "Unknown state";
    }
  }, [connectionState]);

  const value: ConnectionContextValue = {
    state: connectionState,
    check: checkConnection,
    getStatusMessage,
  };

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

/**
 * 使用连接状态的 hook
 * @throws 如果在 ConnectionProvider 外使用将抛出错误
 */
export function useConnection(): ConnectionContextValue {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
}
