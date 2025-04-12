"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  // Menu,
  Home,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: "/", label: "商品価格一覧", icon: <Home className="h-5 w-5" /> },
    {
      href: "/analyze",
      label: "価格分析",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      href: "/document",
      label: "使用説明書",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  // // モバイル用のハンバーガーメニュー
  // const MobileMenu = () => (
  //   <Button
  //     variant="ghost"
  //     size="icon"
  //     className="fixed top-4 left-4 z-50 md:hidden"
  //     onClick={toggleSidebar}
  //   >
  //     <Menu className="h-5 w-5" />
  //   </Button>
  // );

  return (
    <>
      {/* <MobileMenu /> */}

      <motion.div
        className={cn(
          "fixed top-0 left-0 h-full bg-card shadow-lg z-40 hidden md:block",
          isOpen ? "w-64" : "w-16"
        )}
        initial={false}
        animate={{ width: isOpen ? 240 : 64 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="mb-6 flex items-center justify-center">
            {isOpen ? (
              <h2 className="text-xl font-bold text-gradient">
                PSO2NGS 価格リスト
              </h2>
            ) : (
              <span className="text-2xl font-bold text-primary">P</span>
            )}
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start nav-item",
                        isOpen ? "" : "px-2",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                      title={item.label}
                    >
                      <span className={cn("", isOpen ? "mr-2" : "")}>
                        {item.icon}
                      </span>
                      {isOpen && <span className="truncate">{item.label}</span>}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-4 border-t border-border">
            {isMounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full justify-center mb-2"
                title={
                  theme === "dark"
                    ? "ライトモードに切り替え"
                    : "ダークモードに切り替え"
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="w-full justify-center"
              onClick={toggleSidebar}
              aria-label={isOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
            >
              {isOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* モバイル用サイドバー（オーバーレイ） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div
        className={cn(
          "fixed top-0 left-0 h-full bg-card shadow-lg z-40 md:hidden",
          isOpen ? "w-64" : "w-0 -translate-x-full"
        )}
        initial={false}
        animate={{
          width: isOpen ? 240 : 0,
          x: isOpen ? 0 : -240,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gradient">
              PSO2NGS 価格リスト
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start nav-item",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                    >
                      <span className="mr-2">{item.icon}</span>
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-4 border-t border-border">
            {isMounted && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-5 w-5" />
                    <span>ライトモード</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-5 w-5" />
                    <span>ダークモード</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
