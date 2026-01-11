import { useNetwork } from "@/hooks/use-network";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
}

// Reason: 稳定引用的 context，state 通过 getter 访问，对象引用永远不变
const ConnectionStableContext = createContext<ConnectionContextValue | undefined>(undefined);

// Reason: 响应式的 context，state 是实际值，状态变化时会重新提供新值
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

  // Reason: 使用 ref 存储最新状态和函数引用，确保 value 对象引用永远不变
  const checkConnectionRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const stateRef = useRef(connectionState);

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

  // 同步最新状态到 ref
  useEffect(() => {
    stateRef.current = connectionState;
  }, [connectionState]);

  // Reason: 使用 useMemo 和空依赖数组，让 stableValue 对象引用永远不变
  // state 通过 getter 访问 ref，保持引用稳定，避免 Router context 频繁重新计算
  const stableValue: ConnectionContextValue = useMemo(
    () => ({
      get state() {
        return stateRef.current;
      },
      check: () => checkConnectionRef.current!(),
    }),
    [],
  );

  // Reason: 使用 useMemo 创建响应式 value，当 connectionState 变化时返回新对象
  // 触发订阅该 context 的组件重新渲染
  const reactiveValue: ConnectionContextValue = useMemo(
    () => ({
      state: connectionState, // 实际的状态值，不是 getter
      check: () => checkConnectionRef.current!(),
    }),
    [connectionState],
  );

  return (
    <ConnectionStableContext.Provider value={stableValue}>
      <ConnectionContext.Provider value={reactiveValue}>{children}</ConnectionContext.Provider>
    </ConnectionStableContext.Provider>
  );
}

/**
 * 稳定引用版本 - 供 TanStack Router 上下文使用
 * 返回的对象引用永远不变，state 通过 getter 访问最新值
 * 适用于需要稳定引用的场景，避免不必要的上下文重新计算
 * @throws 如果在 ConnectionProvider 外使用将抛出错误
 */
export function useConnectionStable(): ConnectionContextValue {
  const context = useContext(ConnectionStableContext);
  if (context === undefined) {
    throw new Error("useConnectionStable must be used within a ConnectionProvider");
  }
  return context;
}

/**
 * 响应式版本 - 供组件使用
 * 当状态变化时会触发组件重新渲染
 * 返回包含实时状态的对象，适用于需要响应状态变化的 UI 组件
 * @throws 如果在 ConnectionProvider 外使用将抛出错误
 */
export function useConnection(): ConnectionContextValue {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
}
