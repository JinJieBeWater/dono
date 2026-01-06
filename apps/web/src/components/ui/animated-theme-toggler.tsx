import { useCallback, useRef } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { useTheme } from "../theme-provider";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  // 从 useTheme hook 获取当前主题和设置主题的函数
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    // 三态循环切换：light → dark → system → light
    const themeMap = {
      light: "dark",
      dark: "system",
      system: "light",
    } as const;

    const newTheme = themeMap[theme as keyof typeof themeMap] || "light";

    // 检查浏览器是否支持 View Transition API
    if (!document.startViewTransition) {
      // 如果不支持，直接切换主题
      setTheme(newTheme);
      return;
    }

    // 使用 View Transition API 创建过渡动画
    await document.startViewTransition(() => {
      flushSync(() => {
        // 使用 setTheme 函数来切换主题（next-themes 会自动处理 DOM 和 localStorage）
        setTheme(newTheme);
      });
    }).ready;

    // 获取按钮位置，计算圆形扩散动画的中心点
    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    // 计算从按钮到屏幕最远角的距离，作为圆形的最大半径
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    );

    // 应用圆形扩散动画
    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }, [theme, duration, setTheme]);

  // 根据当前主题显示对应的图标
  const ThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Moon />;
      case "dark":
        return <Sun />;
      case "system":
        return <Monitor />;
      default:
        return <Moon />;
    }
  };

  return (
    <Button
      size="icon"
      onClick={toggleTheme}
      variant="outline"
      className={cn("border-0", className)}
      render={<button ref={buttonRef} />}
      {...props}
    >
      <ThemeIcon />
      <span className="sr-only">切换主题 (当前: {theme})</span>
    </Button>
  );
};
