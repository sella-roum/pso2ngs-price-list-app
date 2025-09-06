"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductRecord, ShipKey } from "@/types/product";
import { formatCurrency, getColorClass } from "@/utils/formatters";
import Image from "next/image";
import { ProductDialog } from "@/components/ProductDialog";
import { ShipPopover } from "@/components/ShipPopover";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/formatters";
import { motion } from "framer-motion";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

interface ProductCardProps {
  record: ProductRecord;
}

export const ProductCard: React.FC<ProductCardProps> = ({ record }) => {
  const { comparisonItems, addToComparison, removeFromComparison } = useComparison();

  const isInComparison = comparisonItems.some((item) => item.product_name === record.product_name);

  const handleComparisonToggle = () => {
    if (isInComparison) {
      removeFromComparison(record);
    } else {
      addToComparison(record);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden card-hover">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1">
              <Badge variant="outline" className="mb-1">
                {record.category}
              </Badge>
              <CardTitle className="text-base sm:text-lg line-clamp-2">
                <ProductDialog record={record} />
              </CardTitle>
              <p className="text-xs text-muted-foreground">更新: {formatDate(record.last_modified_date)}</p>
            </div>
            {record.img && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={record.img || "/placeholder.svg"}
                  alt={record.product_name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">最高価格</p>
              <p className="font-bold">{formatCurrency(record.max)}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">最低価格</p>
              <p className="font-bold">{formatCurrency(record.min)}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">平均価格</p>
              <p className="font-medium">{formatCurrency(record.average)}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Ship価格:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 10 }, (_, i) => {
                const shipKey = `ship${i + 1}` as ShipKey;
                const shipValue = record[shipKey] as number;
                if (!shipValue) return null;

                const colorClass = getColorClass(shipValue, record.max, record.min);

                return (
                  <div key={shipKey} className={`${colorClass} p-1 rounded flex items-center justify-between`}>
                    <span className="text-xs font-medium">{shipKey}:</span>
                    <ShipPopover record={record} shipKey={shipKey} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {record.group_name}
            </Badge>

            <Button
              variant={isInComparison ? "default" : "outline"}
              size="sm"
              onClick={handleComparisonToggle}
              className="h-8"
            >
              {isInComparison ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  比較中
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-3 w-3" />
                  比較に追加
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
