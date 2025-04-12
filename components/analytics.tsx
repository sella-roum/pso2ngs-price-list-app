"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // ページビューを記録する関数
    const logPageView = () => {
      // ここに分析コードを追加（例：Google Analytics）
      console.log(`Page view: ${pathname}${searchParams ? `?${searchParams}` : ""}`)
    }

    logPageView()
  }, [pathname, searchParams])

  return null
}
