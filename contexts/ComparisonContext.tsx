"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode } from "react"
import type { ProductRecord } from "@/types/product"

type ComparisonContextType = {
  comparisonItems: ProductRecord[]
  addToComparison: (item: ProductRecord) => void
  removeFromComparison: (item: ProductRecord) => void
  clearComparison: () => void
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export const ComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comparisonItems, setComparisonItems] = useState<ProductRecord[]>([])

  const addToComparison = (item: ProductRecord) => {
    if (comparisonItems.length < 2 && !comparisonItems.some((i) => i.product_name === item.product_name)) {
      setComparisonItems([...comparisonItems, item])
    }
  }

  const removeFromComparison = (item: ProductRecord) => {
    setComparisonItems(comparisonItems.filter((i) => i.product_name !== item.product_name))
  }

  const clearComparison = () => {
    setComparisonItems([])
  }

  return (
    <ComparisonContext.Provider value={{ comparisonItems, addToComparison, removeFromComparison, clearComparison }}>
      {children}
    </ComparisonContext.Provider>
  )
}

export const useComparison = () => {
  const context = useContext(ComparisonContext)
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider")
  }
  return context
}
