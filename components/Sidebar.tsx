"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  List,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      href: "/",
      label: "商品価格一覧",
      icon: <List className="mr-2 h-4 w-4" />,
    },
    {
      href: "/document",
      label: "使用説明書",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      <div
        className={`fixed top-0 left-0 h-full bg-background shadow-lg transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "w-64" : "w-16"
        } ${isOpen ? "" : "-translate-x-16 md:translate-x-0"}`}
      >
        <div className="p-4">
          {isOpen && (
            <h2 className="text-2xl font-bold mb-4">PSO2NGS 価格リスト</h2>
          )}
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className={`w-full justify-start ${isOpen ? "" : "px-2"}`}
                      title={item.label}
                    >
                      {item.icon}
                      {isOpen && item.label}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-2"
          onClick={toggleSidebar}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
}
