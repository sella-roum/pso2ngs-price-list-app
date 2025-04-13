"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, RefreshCw, Download, Filter, X } from "lucide-react";
import type { ProductRecord, SortColumn, SortDirection } from "@/types/product";
import { ProductTable } from "@/components/product-table";
import { ProductCardList } from "@/components/product-card-list";
import { SummaryTab } from "@/components/SummaryTab";
import {
  fetchLatestProducts,
  fetchMaxLastModifiedRecord,
  refreshData,
} from "@/app/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ProductPriceRecordProps {
  initialProducts: ProductRecord[];
  initialCategories: string[];
  initialGroupNames: string[];
}

export const ProductPriceRecord = ({
  initialProducts,
  initialCategories,
  initialGroupNames,
}: ProductPriceRecordProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // URL検索パラメータから状態を取得
  const sortColumn =
    (searchParams.get("sortColumn") as SortColumn) || "last_modified_date";
  const sortDirection =
    (searchParams.get("sortDirection") as SortDirection) || "desc";
  const searchCategory = searchParams.get("category") || "";
  const searchProductName = searchParams.get("productName") || "";
  const searchGroupName = searchParams.get("groupName") || "";
  const currentPage = Number.parseInt(searchParams.get("page") || "1");
  const itemsPerPage = Number.parseInt(
    searchParams.get("itemsPerPage") || "10"
  );

  // ローカル状態
  const [records, setRecords] = useState<ProductRecord[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSearchCategory, setLocalSearchCategory] =
    useState(searchCategory);
  const [localSearchProductName, setLocalSearchProductName] =
    useState(searchProductName);
  const [localSearchGroupName, setLocalSearchGroupName] =
    useState(searchGroupName);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // URL検索パラメータを更新する関数
  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleSort = (column: SortColumn) => {
    const newDirection =
      column === sortColumn && sortDirection === "asc" ? "desc" : "asc";

    updateSearchParams({
      sortColumn: column,
      sortDirection: newDirection,
      page: "1", // ソート変更時は1ページ目に戻る
    });
  };

  const fetchData = async (
    category: string,
    productName: string,
    groupName: string,
    lastModified = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = lastModified
        ? await fetchMaxLastModifiedRecord()
        : await fetchLatestProducts(category, productName, groupName);

      setRecords(data);

      // 検索結果が空の場合はメッセージを表示
      if (data.length === 0 && !lastModified) {
        toast({
          title: "検索結果",
          description: "条件に一致する商品が見つかりませんでした。",
          variant: "default",
        });
      } else if (!lastModified) {
        toast({
          title: "検索完了",
          description: `${data.length}件の商品が見つかりました。`,
        });
      }

      // 検索成功時にページを1に戻す
      if (!lastModified) {
        updateSearchParams({ page: "1" });
      }
    } catch (error) {
      console.error(error);
      setError(
        "データの取得中にエラーが発生しました。ネットワーク接続を確認し、再度お試しください。エラーが続く場合は、管理者にお問い合わせください。"
      );
      toast({
        title: "エラー",
        description: "データの取得中にエラーが発生しました。",
        variant: "destructive",
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // 検索パラメータを更新
    updateSearchParams({
      category: localSearchCategory,
      productName: localSearchProductName,
      groupName: localSearchGroupName,
      page: "1", // 検索時は1ページ目に戻る
    });

    fetchData(
      localSearchCategory,
      localSearchProductName,
      localSearchGroupName
    );
    setIsFilterOpen(false);
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      toast({
        title: "更新完了",
        description: "データが最新の状態に更新されました。",
      });
      fetchData("", "", "", true);
    } catch {
      toast({
        title: "エラー",
        description: "データの更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleClearFilters = () => {
    setLocalSearchCategory("");
    setLocalSearchProductName("");
    setLocalSearchGroupName("");

    updateSearchParams({
      category: "",
      productName: "",
      groupName: "",
      page: "1",
    });

    fetchData("", "", "");
    setIsFilterOpen(false);
  };

  // URL検索パラメータが変更されたときにローカル検索状態を更新
  useEffect(() => {
    setLocalSearchCategory(searchCategory);
    setLocalSearchProductName(searchProductName);
    setLocalSearchGroupName(searchGroupName);
  }, [searchCategory, searchProductName, searchGroupName]);

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
          ...Array.from(
            { length: 10 },
            (_, i) => record[`ship${i + 1}` as keyof ProductRecord]
          ),
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

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  const handleItemsPerPageChange = (value: string) => {
    updateSearchParams({
      itemsPerPage: value,
      page: "1", // 表示件数変更時は1ページ目に戻る
    });
  };

  // アクティブなフィルターの数を計算
  const activeFiltersCount = [
    searchCategory,
    searchProductName,
    searchGroupName,
  ].filter(Boolean).length;

  return (
    <div className="w-full">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => fetchData("", "", "", true)}
              disabled={loading}
              className="whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  データ取得中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  最終更新日のデータを取得
                </>
              )}
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="whitespace-nowrap"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              データを更新
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="whitespace-nowrap"
            >
              <Filter className="mr-2 h-4 w-4" />
              フィルター
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <Button
              onClick={handleCSVDownload}
              disabled={sortedRecords.length === 0}
              variant="outline"
              className="whitespace-nowrap"
            >
              <Download className="mr-2 h-4 w-4" />
              CSVダウンロード
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">検索条件</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-8 px-2"
                      >
                        <X className="mr-1 h-4 w-4" />
                        クリア
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="category"
                          className="text-sm font-medium"
                        >
                          カテゴリ
                        </label>
                        <Select
                          value={localSearchCategory}
                          onValueChange={setLocalSearchCategory}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全てのカテゴリ</SelectItem>
                            {initialCategories.map(
                              (category) =>
                                category && (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="groupName"
                          className="text-sm font-medium"
                        >
                          グループ名
                        </label>
                        <Select
                          value={localSearchGroupName}
                          onValueChange={setLocalSearchGroupName}
                        >
                          <SelectTrigger id="groupName">
                            <SelectValue placeholder="グループ名を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全てのグループ</SelectItem>
                            {initialGroupNames.map(
                              (groupName) =>
                                groupName && (
                                  <SelectItem key={groupName} value={groupName}>
                                    {groupName}
                                  </SelectItem>
                                )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="productName"
                          className="text-sm font-medium"
                        >
                          商品名
                        </label>
                        <Input
                          id="productName"
                          type="text"
                          value={localSearchProductName}
                          onChange={(e) =>
                            setLocalSearchProductName(e.target.value)
                          }
                          placeholder="商品名を入力（部分一致）"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        キャンセル
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            検索中...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            検索
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* アクティブなフィルターの表示 */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              アクティブなフィルター:
            </span>
            {searchCategory && (
              <Badge variant="outline" className="flex items-center gap-1">
                カテゴリ: {searchCategory}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setLocalSearchCategory("");
                    updateSearchParams({ category: "", page: "1" });
                    fetchData("", searchProductName, searchGroupName);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {searchGroupName && (
              <Badge variant="outline" className="flex items-center gap-1">
                グループ: {searchGroupName}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setLocalSearchGroupName("");
                    updateSearchParams({ groupName: "", page: "1" });
                    fetchData(searchCategory, searchProductName, "");
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {searchProductName && (
              <Badge variant="outline" className="flex items-center gap-1">
                商品名: {searchProductName}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setLocalSearchProductName("");
                    updateSearchParams({ productName: "", page: "1" });
                    fetchData(searchCategory, "", searchGroupName);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-2 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            データを取得中です。しばらくお待ちください...
          </p>
        </div>
      ) : sortedRecords.length > 0 ? (
        <Tabs defaultValue="table" className="w-full">
          <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
            <TabsList>
              <TabsTrigger value="table">レコード一覧</TabsTrigger>
              {/* <TabsTrigger value="cards">カード表示</TabsTrigger> */}
              <TabsTrigger value="summary">サマリ</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="animate-fade-in">
            <div className="hidden sm:block">
              <ProductTable
                records={paginatedRecords}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </div>
            <div className="sm:hidden">
              <ProductCardList records={paginatedRecords} />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">1ページあたりの表示件数:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  全 {sortedRecords.length} 件中{" "}
                  {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, sortedRecords.length)}{" "}
                  件を表示
                </div>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="cards" className="animate-fade-in">
            <ProductCardList records={paginatedRecords} />

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">1ページあたりの表示件数:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  全 {sortedRecords.length} 件中{" "}
                  {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, sortedRecords.length)}{" "}
                  件を表示
                </div>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="summary" className="animate-fade-in">
            <SummaryTab records={sortedRecords} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl font-semibold text-gray-700">
            データがありません
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            検索条件を変更するか、新しいデータを追加してください。
          </p>
        </div>
      )}
    </div>
  );
};
