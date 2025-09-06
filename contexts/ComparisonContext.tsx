"use client";

import type React from "react";
import { createContext, useState, useContext, type ReactNode, useEffect } from "react";
import type { ProductRecord } from "@/types/product";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type ComparisonContextType = {
  comparisonItems: ProductRecord[];
  addToComparison: (item: ProductRecord) => void;
  removeFromComparison: (item: ProductRecord) => void;
  clearComparison: () => void;
  compareItems: () => void;
  isComparing: boolean;
};

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARISON_ITEMS = 2;

export const ComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comparisonItems, setComparisonItems] = useState<ProductRecord[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // ローカルストレージから比較アイテムを復元
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem("comparisonItems");
      if (savedItems) {
        const data = JSON.parse(savedItems);
        if (Array.isArray(data) && data.every((i) => i && typeof i.product_name === "string")) {
          setComparisonItems(data);
        }
      }
    } catch (error) {
      console.error("Failed to load comparison items from localStorage:", error);
    }
  }, []);

  // 比較アイテムをローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem("comparisonItems", JSON.stringify(comparisonItems));
    } catch (error) {
      console.error("Failed to save comparison items to localStorage:", error);
    }
  }, [comparisonItems]);

  // ルート変更後に比較状態をリセット
  useEffect(() => {
    setIsComparing(false);
  }, [pathname]);

  const addToComparison = (item: ProductRecord) => {
    if (
      comparisonItems.length < MAX_COMPARISON_ITEMS &&
      !comparisonItems.some((i) => i.product_name === item.product_name)
    ) {
      setComparisonItems([...comparisonItems, item]);
      toast({
        title: "比較リストに追加しました",
        description: `${item.product_name}を比較リストに追加しました。`,
      });
    } else if (comparisonItems.some((i) => i.product_name === item.product_name)) {
      toast({
        title: "既に追加されています",
        description: "この商品は既に比較リストに追加されています。",
        variant: "destructive",
      });
    } else {
      toast({
        title: "比較リストがいっぱいです",
        description: `比較リストには最大${MAX_COMPARISON_ITEMS}つのアイテムしか追加できません。`,
        variant: "destructive",
      });
    }
  };

  const removeFromComparison = (item: ProductRecord) => {
    setComparisonItems(comparisonItems.filter((i) => i.product_name !== item.product_name));
    toast({
      title: "比較リストから削除しました",
      description: `${item.product_name}を比較リストから削除しました。`,
    });
  };

  const clearComparison = () => {
    setComparisonItems([]);
    toast({
      title: "比較リストをクリアしました",
      description: "比較リストを空にしました。",
    });
  };

  const compareItems = () => {
    if (comparisonItems.length !== MAX_COMPARISON_ITEMS) {
      toast({
        title: "比較できません",
        description: `比較するには${MAX_COMPARISON_ITEMS}つのアイテムを選択してください。`,
        variant: "destructive",
      });
      return;
    }

    setIsComparing(true);
    router.push("/comparison");
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonItems,
        addToComparison,
        removeFromComparison,
        clearComparison,
        compareItems,
        isComparing,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};
