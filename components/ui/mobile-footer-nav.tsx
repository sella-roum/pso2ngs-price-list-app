"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, BarChart2, FileText } from "lucide-react"
import { motion } from "framer-motion"

export const MobileFooterNav = () => {
  const pathname = usePathname()

  const menuItems = [
    { href: "/", label: "商品一覧", icon: <Home className="h-5 w-5" /> },
    { href: "/analyze", label: "分析", icon: <BarChart2 className="h-5 w-5" /> },
    { href: "/document", label: "説明書", icon: <FileText className="h-5 w-5" /> },
  ]

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <nav className="flex justify-around items-center h-16">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full px-2 py-1 relative",
              pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {pathname === item.href && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary/10 rounded-md"
                transition={{ duration: 0.2 }}
              />
            )}
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </motion.div>
  )
}
