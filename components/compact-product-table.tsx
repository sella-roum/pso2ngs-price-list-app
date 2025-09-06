"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProductRecord, ShipKey, SortColumn, SortDirection } from "@/types/product";
import { formatCurrency } from "@/utils/formatters";
import { ProductDialog } from "@/components/ProductDialog";
import { ArrowUp, ArrowDown, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompactProductTableProps {
  records: ProductRecord[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

type MinMaxShips = {
  minShip: { key: ShipKey; value: number } | null;
  maxShip: { key: ShipKey; value: number } | null;
};

export const CompactProductTable = ({ records, sortColumn, sortDirection, onSort }: CompactProductTableProps) => {
  const { comparisonItems, addToComparison, removeFromComparison } = useComparison();

  const isInComparison = (record: ProductRecord) =>
    comparisonItems.some((item) => item.product_name === record.product_name);

  const handleComparisonToggle = (record: ProductRecord) => {
    if (isInComparison(record)) {
      removeFromComparison(record);
    } else {
      addToComparison(record);
    }
  };

  const getMinMaxShips = (record: ProductRecord): MinMaxShips => {
    let minShip: { key: ShipKey; value: number } | null = null;
    let maxShip: { key: ShipKey; value: number } | null = null;

    const shipKeys: ShipKey[] = [
      "ship1",
      "ship2",
      "ship3",
      "ship4",
      "ship5",
      "ship6",
      "ship7",
      "ship8",
      "ship9",
      "ship10",
    ];

    for (const shipKey of shipKeys) {
      const shipValue = record[shipKey];
      if (shipValue !== null && shipValue !== undefined) {
        if (!minShip || shipValue < minShip.value) {
          minShip = { key: shipKey, value: shipValue };
        }
        if (!maxShip || shipValue > maxShip.value) {
          maxShip = { key: shipKey, value: shipValue };
        }
      }
    }

    return { minShip, maxShip };
  };

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => onSort("category")} className="cursor-pointer">
              カテゴリ{" "}
              {sortColumn === "category" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead onClick={() => onSort("product_name")} className="cursor-pointer">
              商品名{" "}
              {sortColumn === "product_name" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead onClick={() => onSort("max")} className="cursor-pointer">
              最高価格{" "}
              {sortColumn === "max" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead onClick={() => onSort("min")} className="cursor-pointer">
              最低価格{" "}
              {sortColumn === "min" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead>最安Ship</TableHead>
            <TableHead>最高Ship</TableHead>
            <TableHead onClick={() => onSort("group_name")} className="cursor-pointer">
              グループ名{" "}
              {sortColumn === "group_name" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead>比較</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => {
            const { minShip, maxShip } = getMinMaxShips(record);

            return (
              <motion.tr
                key={record.id ?? `${record.product_name}-${record.last_modified_date}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-muted/20"
              >
                <TableCell>
                  <Badge variant="outline">{record.category ?? "-"}</Badge>
                </TableCell>
                <TableCell>
                  <ProductDialog record={record} />
                </TableCell>
                <TableCell className="bg-red-100 dark:bg-red-900/30 font-bold">{formatCurrency(record.max)}</TableCell>
                <TableCell className="bg-blue-100 dark:bg-blue-900/30 font-bold">
                  {formatCurrency(record.min)}
                </TableCell>
                <TableCell>
                  {minShip ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200">
                            {minShip.key}: {formatCurrency(minShip.value)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>最安値のShip</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {maxShip ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200">
                            {maxShip.key}: {formatCurrency(maxShip.value)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>最高値のShip</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{record.group_name ?? "-"}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant={isInComparison(record) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleComparisonToggle(record)}
                    className="h-8 w-8 p-0"
                  >
                    {isInComparison(record) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
