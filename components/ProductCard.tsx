import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductRecord } from "@/types/product";
import { formatCurrency } from "@/utils/formatters";
import Image from "next/image";
import { ProductDialog } from "@/components/ProductDialog";
import { ShipPopover } from "@/components/ShipPopover";

interface ProductCardProps {
  record: ProductRecord;
}

export const ProductCard: React.FC<ProductCardProps> = ({ record }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ProductDialog record={record} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>カテゴリ:</strong> {record.category}</p>
            <p><strong>最終更新日:</strong> {record.last_modified_date}</p>
            <p><strong>グループ名:</strong> {record.group_name}</p>
          </div>
          <div>
            {record.img && (
              <div className="w-32 h-32 relative overflow-hidden ml-auto">
                <Image
                  src={record.img}
                  alt={record.product_name}
                  width={128}
                  height={128}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <p><strong>最高価格:</strong> {formatCurrency(record.max)}</p>
          <p><strong>最低価格:</strong> {formatCurrency(record.min)}</p>
          <p><strong>平均価格:</strong> {formatCurrency(record.average)}</p>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Ship価格:</h4>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 10 }, (_, i) => {
              const shipKey = `ship${i + 1}`;
              return (
                <div key={shipKey} className="flex items-center">
                  <span className="mr-2 text-sm font-medium">{shipKey}:</span>
                  <ShipPopover record={record} shipKey={shipKey} />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

