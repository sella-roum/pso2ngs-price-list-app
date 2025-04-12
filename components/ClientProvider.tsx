"use client"

import { ComparisonProvider } from "@/contexts/ComparisonContext"
import type React from "react"

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return <ComparisonProvider>{children}</ComparisonProvider>
}
