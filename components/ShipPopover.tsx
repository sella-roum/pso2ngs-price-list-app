import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ProductRecord } from "@/types/product";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface ShipPopoverProps {
  record: ProductRecord;
  shipKey: string;
}

export const ShipPopover: React.FC<ShipPopoverProps> = ({ record, shipKey }) => {
  let ships: {
    [shipName: string]: { last_modified: string; price_list: number[] };
  } = {};

  // record.ships が null でなく、オブジェクトであることを確認
  if (record.ships && typeof record.ships === "object" && !Array.isArray(record.ships)) {
    if (typeof record.ships === "string") {
      try {
        // 文字列の場合はJSONとしてパースを試みる
        const parsedShips = JSON.parse(record.ships);
        if (typeof parsedShips === "object" && parsedShips !== null) {
          ships = parsedShips;
        }
      } catch (error) {
        console.error("Failed to parse ships data:", error);
      }
    } else {
      // 既にオブジェクトの場合はそのまま代入
      ships = record.ships as typeof ships;
    }
  }

  const currentShip = ships[shipKey] || { last_modified: "", price_list: [] };

  if (!currentShip.price_list || currentShip.price_list.length === 0) {
    return <span>データなし</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start" aria-label={`${shipKey}の価格詳細を表示`}>
          {formatCurrency(currentShip.price_list[0])}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">{record.product_name}</h4>
            <p className="text-xs text-muted-foreground">グループ名: {record.group_name}</p>
            <p className="text-xs text-muted-foreground">カテゴリー名: {record.category}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">{shipKey}の価格詳細</p>
            <p className="text-xs text-muted-foreground">最終更新: {formatDate(currentShip.last_modified)}</p>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">現在価格:</span>
              <span className="text-sm font-bold">{formatCurrency(currentShip.price_list[0])}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">最高価格との差:</span>
              <span className="text-sm">
                {record.max === currentShip.price_list[0]
                  ? "0"
                  : "+" + formatCurrency(record.max - currentShip.price_list[0])}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">最低価格との差:</span>
              <span className="text-sm">
                {record.min === currentShip.price_list[0]
                  ? "0"
                  : "-" + formatCurrency(currentShip.price_list[0] - record.min)}
              </span>
            </div>
          </div>
          {currentShip.price_list.length > 1 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">その他陳列価格</h5>
              <ul className="text-sm space-y-1">
                {currentShip.price_list.slice(1).map((price, index) => (
                  <li key={index} className="flex justify-between">
                    <span>価格{index + 1}:</span>
                    <span>{formatCurrency(price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
