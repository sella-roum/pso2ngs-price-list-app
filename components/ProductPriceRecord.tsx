"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductRecord } from "@/types/product";
import { formatCurrency, getColorClass } from "@/utils/formatters";
import { ShipPopover } from "@/components/ShipPopover";
import { ProductDialog } from "@/components/ProductDialog";
import { SummaryTab } from "@/components/SummaryTab";
import { fetchLatestProducts, fetchMaxLastModifiedRecord } from "@/app/actions";
import { ProductCard } from "@/components/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MemoizedShipPopover = React.memo(ShipPopover);
const MemoizedProductDialog = React.memo(ProductDialog);

interface ProductPriceRecordProps {
  initialProducts: ProductRecord[];
  initialCategories: string[];
  initialGroupNames: string[];
}

export const ProductPriceRecord: React.FC<ProductPriceRecordProps> = ({
  initialProducts,
  initialCategories,
  initialGroupNames,
}) => {
  const [records, setRecords] = useState<ProductRecord[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] =
    useState<keyof ProductRecord>("last_modified_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchProductName, setSearchProductName] = useState("");
  const [searchGroupName, setSearchGroupName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpToPage, setJumpToPage] = useState("");
  const [
    categories,
    // setCategories
  ] = useState<string[]>(initialCategories);
  const [
    groupNames,
    // setGroupNames
  ] = useState<string[]>(initialGroupNames);

  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setItemsPerPage(settings.itemsPerPage || 10);
      setSortColumn(settings.sortColumn || "last_modified_date");
      setSortDirection(settings.sortDirection || "desc");
    }
  }, []);

  useEffect(() => {
    const settings = { itemsPerPage, sortColumn, sortDirection };
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [itemsPerPage, sortColumn, sortDirection]);

  const handleSort = (column: keyof ProductRecord) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const fetchData = async (
    category: string,
    productName: string,
    groupName: string,
    last_modified: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = last_modified
        ? await fetchMaxLastModifiedRecord()
        : await fetchLatestProducts(category, productName, groupName);
      setRecords(data);
      setCurrentPage(1);
    } catch (error) {
      console.log(error);
      setError(
        "データの取得中にエラーが発生しました。ネットワーク接続を確認し、再度お試しください。エラーが続く場合は、管理者にお問い合わせください。"
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchCategory, searchProductName, searchGroupName);
  };

  const sortedRecords = useMemo(() => {
    const sortFn = (a: ProductRecord, b: ProductRecord) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "number" && typeof bValue === "number") {
        const diff = aValue - bValue;
        return sortDirection === "asc" ? diff : -diff;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        const collator = new Intl.Collator("ja-JP");
        const diff = collator.compare(aValue, bValue);
        return sortDirection === "asc" ? diff : -diff;
      } else {
        console.warn(
          `Cannot compare values of different types: ${typeof aValue} and ${typeof bValue}`
        );
        return 0;
      }
    };

    return [...records].sort(sortFn);
  }, [records, sortColumn, sortDirection]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRecords, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);

  const handleCSVDownload = () => {
    const headers = [
      "カテゴリ",
      "最終更新日",
      "商品名",
      "最高価格",
      "最低価格",
      "平均価格",
      ...Array.from({ length: 10 }, (_, i) => `ship${i + 1}`),
      "グループ名",
    ];
    const csvContent = [
      headers.join(","),
      ...sortedRecords.map((record) =>
        [
          record.category,
          record.last_modified_date,
          record.product_name,
          record.max,
          record.min,
          record.average,
          ...Array.from({ length: 10 }, (_, i) => record[`ship${i + 1}`]),
          record.group_name,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "product_records.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">商品価格一覧</h1>
      <div className="mb-4 space-y-4">
        <Button onClick={() => fetchData("", "", "", true)} disabled={loading}>
          {loading ? "データを取得中..." : "最終更新日のデータを取得"}
        </Button>
      </div>
      <form
        onSubmit={handleSearch}
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <Select value={searchCategory} onValueChange={setSearchCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのカテゴリ</SelectItem>
            {categories.map(
              (category) =>
                category && (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                )
            )}
          </SelectContent>
        </Select>
        <Select value={searchGroupName} onValueChange={setSearchGroupName}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="グループ名を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのグループ</SelectItem>
            {groupNames.map(
              (groupName) =>
                groupName && (
                  <SelectItem key={groupName} value={groupName}>
                    {groupName}
                  </SelectItem>
                )
            )}
          </SelectContent>
        </Select>
        <Input
          type="text"
          value={searchProductName}
          onChange={(e) => setSearchProductName(e.target.value)}
          placeholder="商品名を入力（部分一致）"
          className="flex-1 min-w-[200px]"
        />
        <Button type="submit" disabled={loading} className="whitespace-nowrap">
          検索
        </Button>
      </form>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">
            データを取得中です。しばらくお待ちください...
          </p>
        </div>
      ) : sortedRecords.length > 0 ? (
        <Tabs defaultValue="table" className="w-full">
          <div className="mb-4 flex gap-2">
            <TabsList>
              <TabsTrigger value="table">レコード一覧</TabsTrigger>
              <TabsTrigger value="summary">サマリ</TabsTrigger>
            </TabsList>
            <Button
              onClick={handleCSVDownload}
              disabled={sortedRecords.length === 0}
            >
              CSVダウンロード
            </Button>
          </div>
          <TabsContent value="table">
            <div className="overflow-x-auto w-full">
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort("category")}>
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
                        onClick={() => handleSort("last_modified_date")}
                      >
                        最終更新日{" "}
                        {sortColumn === "last_modified_date" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="inline-block w-4 h-4" />
                          ) : (
                            <ArrowDown className="inline-block w-4 h-4" />
                          ))}
                      </TableHead>
                      <TableHead onClick={() => handleSort("product_name")}>
                        商品名{" "}
                        {sortColumn === "product_name" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="inline-block w-4 h-4" />
                          ) : (
                            <ArrowDown className="inline-block w-4 h-4" />
                          ))}
                      </TableHead>
                      <TableHead onClick={() => handleSort("max")}>
                        最高価格{" "}
                        {sortColumn === "max" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="inline-block w-4 h-4" />
                          ) : (
                            <ArrowDown className="inline-block w-4 h-4" />
                          ))}
                      </TableHead>
                      <TableHead onClick={() => handleSort("min")}>
                        最低価格{" "}
                        {sortColumn === "min" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="inline-block w-4 h-4" />
                          ) : (
                            <ArrowDown className="inline-block w-4 h-4" />
                          ))}
                      </TableHead>
                      <TableHead onClick={() => handleSort("average")}>
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
                      <TableHead onClick={() => handleSort("group_name")}>
                        グループ名{" "}
                        {sortColumn === "group_name" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="inline-block w-4 h-4" />
                          ) : (
                            <ArrowDown className="inline-block w-4 h-4" />
                          ))}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{record.category}</TableCell>
                        <TableCell>
                          {record.img && (
                            <div className="w-32 h-32 relative overflow-hidden">
                              <Image
                                src={record.img}
                                alt={record.product_name}
                                width={128}
                                height={128}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{record.last_modified_date}</TableCell>
                        <TableCell>
                          <MemoizedProductDialog record={record} />
                        </TableCell>
                        <TableCell className="bg-red-100 font-bold">
                          {formatCurrency(record.max)}
                        </TableCell>
                        <TableCell className="bg-blue-100 font-bold">
                          {formatCurrency(record.min)}
                        </TableCell>
                        <TableCell>{formatCurrency(record.average)}</TableCell>
                        {Array.from({ length: 10 }, (_, i) => {
                          const shipKey = `ship${i + 1}`;
                          const shipValue = record[shipKey] as number;
                          const colorClass = getColorClass(
                            shipValue,
                            record.max,
                            record.min
                          );
                          return (
                            <TableCell key={i} className={colorClass}>
                              <MemoizedShipPopover
                                record={record}
                                shipKey={shipKey}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell>{record.group_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="sm:hidden space-y-4">
                {paginatedRecords.map((record, index) => (
                  <ProductCard key={index} record={record} />
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Input
                  type="number"
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  placeholder="ページ番号"
                  className="w-24"
                />
                <Button
                  onClick={() => {
                    const page = parseInt(jumpToPage);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                      setJumpToPage("");
                    }
                  }}
                  disabled={!jumpToPage}
                >
                  ジャンプ
                </Button>
                <span className="mr-2">1ページあたりの表示件数:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border rounded p-1"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (pageNum) =>
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                  )
                  .map((pageNum, i, array) => {
                    if (i > 0 && array[i - 1] !== pageNum - 1) {
                      return (
                        <React.Fragment key={`ellipsis-${pageNum}`}>
                          <span className="px-2">...</span>
                          <Button
                            variant={
                              currentPage === pageNum ? "default" : "outline"
                            }
                            onClick={() => setCurrentPage(pageNum)}
                            className={
                              currentPage === pageNum
                                ? "bg-blue-500 text-white"
                                : ""
                            }
                          >
                            {pageNum}
                          </Button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-blue-500 text-white"
                            : ""
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="summary">
            <SummaryTab records={sortedRecords} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl font-semibold text-gray-700">
            データがありません
          </p>
          <p className="text-sm text-gray-500 mt-2">
            検索条件を変更するか、新しいデータを追加してください。
          </p>
        </div>
      )}
    </div>
  );
};
