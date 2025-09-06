"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProductRecord, ShipKey, SortColumn, SortDirection } from "@/types/product";
import { formatCurrency, getColorClass, formatDate } from "@/utils/formatters";
import { ShipPopover } from "@/components/ShipPopover";
import { ProductDialog } from "@/components/ProductDialog";
import { ArrowUp, ArrowDown, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import { motion } from "framer-motion";

interface ProductTableProps {
  records: ProductRecord[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export function ProductTable({ records, sortColumn, sortDirection, onSort }: ProductTableProps) {
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

  return (
    <div className="table-container">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => onSort("category")}
              className="cursor-pointer"
              aria-sort={sortColumn === "category" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
            >
              カテゴリ{" "}
              {sortColumn === "category" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead>画像</TableHead>
            <TableHead
              onClick={() => onSort("last_modified_date")}
              className="cursor-pointer"
              aria-sort={
                sortColumn === "last_modified_date" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
              }
            >
              最終更新日{" "}
              {sortColumn === "last_modified_date" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => onSort("product_name")}
              className="cursor-pointer"
              aria-sort={
                sortColumn === "product_name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
              }
            >
              商品名{" "}
              {sortColumn === "product_name" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => onSort("max")}
              className="cursor-pointer"
              aria-sort={sortColumn === "max" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
            >
              最高価格{" "}
              {sortColumn === "max" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => onSort("min")}
              className="cursor-pointer"
              aria-sort={sortColumn === "min" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
            >
              最低価格{" "}
              {sortColumn === "min" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            <TableHead
              onClick={() => onSort("average")}
              className="cursor-pointer"
              aria-sort={sortColumn === "average" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
            >
              平均価格{" "}
              {sortColumn === "average" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="inline-block w-4 h-4" />
                ) : (
                  <ArrowDown className="inline-block w-4 h-4" />
                ))}
            </TableHead>
            {Array.from({ length: 10 }, (_, i) => (
              <TableHead key={i}>ship{i + 1}</TableHead>
            ))}
            <TableHead
              onClick={() => onSort("group_name")}
              className="cursor-pointer"
              aria-sort={sortColumn === "group_name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
            >
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
          {records.map((record, index) => (
            <motion.tr
              key={record.id ?? `${record.product_name}-${record.last_modified_date}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="hover:bg-muted/20"
            >
              <TableCell>{record.category}</TableCell>
              <TableCell>
                {record.img && (
                  <div className="w-16 h-16 relative overflow-hidden rounded">
                    <Image src={record.img} alt={record.product_name} width={64} height={64} className="object-cover" />
                  </div>
                )}
              </TableCell>
              <TableCell>{formatDate(record.last_modified_date)}</TableCell>
              <TableCell>
                <ProductDialog record={record} />
              </TableCell>
              <TableCell className="bg-red-100 dark:bg-red-900/30 font-bold">{formatCurrency(record.max)}</TableCell>
              <TableCell className="bg-blue-100 dark:bg-blue-900/30 font-bold">{formatCurrency(record.min)}</TableCell>
              <TableCell>{formatCurrency(record.average)}</TableCell>
              {Array.from({ length: 10 }, (_, i) => {
                const shipKey = `ship${i + 1}` as ShipKey;
                const shipValue = record[shipKey];
                const colorClass = getColorClass(shipValue, record.max, record.min);
                return (
                  <TableCell key={i} className={colorClass}>
                    <ShipPopover record={record} shipKey={shipKey} />
                  </TableCell>
                );
              })}
              <TableCell>{record.group_name}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
