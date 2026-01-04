import { createContext, useContext, useState, type ReactNode } from "react";

// Outline面板状态管理
type OutlineContextType = {
  isOutlineOpen: boolean;
  setIsOutlineOpen: (open: boolean) => void;
};

const OutlineContext = createContext<OutlineContextType | null>(null);

// Provider 组件，包含状态管理
export function OutlineProvider({ children }: { children: ReactNode }) {
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);

  return (
    <OutlineContext.Provider value={{ isOutlineOpen, setIsOutlineOpen }}>
      {children}
    </OutlineContext.Provider>
  );
}

// Hook 用于访问 Outline 状态
export function useOutline() {
  const context = useContext(OutlineContext);
  if (!context) {
    throw new Error("useOutline must be used within OutlineProvider");
  }
  return context;
}
