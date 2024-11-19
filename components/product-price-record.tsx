"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Bar, BarChart as BarChartRecharts } from "recharts";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseApiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type ProductRecord = {
  [key: string]:
    | number
    | string
    | {
        [shipName: string]: {
          price_list: number[];
          last_modified: string;
        };
      };
  last_modified_date: string;
  product_name: string;
  max: number;
  min: number;
  average: number;
  ships: {
    [shipName: string]: {
      price_list: number[];
      last_modified: string;
    };
  };
};

const ShipPopover = React.memo(
  ({ record, shipKey }: { record: ProductRecord; shipKey: string }) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("ja-JP", { style: "decimal" }).format(
        amount
      );
    };

    let ships: {
      [shipName: string]: { last_modified: string; price_list: number[] };
    } = {};
    if (typeof record.ships === "string") {
      try {
        ships = JSON.parse(record.ships);
      } catch (error) {
        console.error("Failed to parse ships data:", error);
      }
    } else if (typeof record.ships === "object") {
      ships = record.ships;
    }
    const currentShip = ships[shipKey] || { last_modified: "", price_list: [] };

    if (!currentShip.price_list || currentShip.price_list.length === 0) {
      return <span>データなし</span>;
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="underline text-blue-600 hover:text-blue-800">
            {formatCurrency(currentShip.price_list[0])}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">価格詳細</h4>
              <p className="text-sm text-muted-foreground">
                最終更新: {formatDate(currentShip.last_modified)}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 items-center gap-4">
                <span className="text-sm font-medium">価格</span>
              </div>
              {currentShip.price_list.map((price: number, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-2 items-center gap-4"
                >
                  <span className="text-sm">{formatCurrency(price)}</span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
ShipPopover.displayName = "ShipPopover";

const ProductDialog = React.memo(
  ({
    record,
  }: // supabaseUrl,
  // supabaseApiKey,
  {
    record: ProductRecord;
    // supabaseUrl: string;
    // supabaseApiKey: string;
  }) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    const getColorClass = (value: number, max: number, min: number) => {
      if (value === max) return "bg-red-100 font-bold";
      if (value === min) return "bg-blue-100 font-bold";
      const range = max - min;
      const normalizedValue = (value - min) / range;
      if (normalizedValue > 0.8) return "bg-red-50 font-semibold";
      if (normalizedValue < 0.2) return "bg-blue-50 font-semibold";
      return "";
    };
    const [selectedShips, setSelectedShips] = useState<string[]>(
      Array.from({ length: 10 }, (_, i) => `ship${i + 1}`)
    );
    const [timeSeriesData, setTimeSeriesData] = useState<ProductRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("ja-JP", { style: "decimal" }).format(
        amount
      );
    };

    const queryRecordsByProductName = async (productName: string) => {
      setLoading(true);
      setError(null);
      const endpoint = `${supabaseUrl}/rest/v1/ProductPriceList`;
      const query = {
        select: "*",
        product_name: `eq.${productName}`,
        order: "last_modified_date.asc",
      };
      const params = Object.entries(query)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join("&");
      const options = {
        method: "GET",
        headers: {
          apikey: supabaseApiKey as string,
          Authorization: `Bearer ${supabaseApiKey}`,
          "Content-Type": "application/json",
        },
      };

      try {
        const response = await fetch(`${endpoint}?${params}`, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTimeSeriesData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error querying Supabase:", error);
        setError("データの取得中にエラーが発生しました。");
        setTimeSeriesData([]);
      } finally {
        setLoading(false);
      }
    };

    const handleShipToggle = (shipName: string) => {
      setSelectedShips((prev) =>
        prev.includes(shipName)
          ? prev.filter((ship) => ship !== shipName)
          : [...prev, shipName].sort((a, b) => {
              const aNum = parseInt(a.replace("ship", ""));
              const bNum = parseInt(b.replace("ship", ""));
              return aNum - bNum;
            })
      );
    };

    const chartData = timeSeriesData.map((record) => {
      const dataPoint: { [key: string]: string | number } = {
        date: record.last_modified_date,
      };
      Array.from({ length: 10 }, (_, i) => `ship${i + 1}`).forEach(
        (shipName) => {
          dataPoint[shipName] = record[shipName] as number;
        }
      );
      return dataPoint;
    });

    return (
      <Dialog
        onOpenChange={(open) => {
          if (open) {
            queryRecordsByProductName(record.product_name);
          }
        }}
      >
        <DialogTrigger asChild>
          <button className="underline text-blue-600 hover:text-blue-800">
            {record.product_name}
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[80vw] max-h-[80vh] w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{record.product_name}の価格遷移</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              データを読み込んでいます...
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : timeSeriesData.length === 0 ? (
            <div>データがありません</div>
          ) : (
            <Tabs defaultValue="graph" className="w-full">
              <TabsList>
                <TabsTrigger value="graph">グラフ</TabsTrigger>
                <TabsTrigger value="table">表</TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap gap-2 my-4">
                {Array.from({ length: 10 }, (_, i) => `ship${i + 1}`).map(
                  (shipName) => (
                    <div key={shipName} className="flex items-center">
                      <Checkbox
                        id={`ship-${shipName}`}
                        checked={selectedShips.includes(shipName)}
                        onCheckedChange={() => handleShipToggle(shipName)}
                      />
                      <Label htmlFor={`ship-${shipName}`} className="ml-2">
                        {shipName}
                      </Label>
                    </div>
                  )
                )}
              </div>
              <TabsContent value="graph">
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">価格遷移グラフ</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Legend />
                      {Array.from({ length: 10 }, (_, i) => `ship${i + 1}`).map(
                        (shipName, index) => (
                          <Line
                            key={shipName}
                            type="monotone"
                            dataKey={shipName}
                            stroke={`hsl(${index * 36}, 70%, 50%)`}
                            hide={!selectedShips.includes(shipName)}
                          />
                        )
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="table">
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">価格遷移表</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>日付</TableHead>
                          <TableHead>最高価格</TableHead>
                          <TableHead>最低価格</TableHead>
                          <TableHead>平均価格</TableHead>
                          {Array.from({ length: 10 }, (_, i) => `ship${i + 1}`)
                            .filter((shipName) =>
                              selectedShips.includes(shipName)
                            )
                            .map((shipName) => (
                              <TableHead key={shipName}>{shipName}</TableHead>
                            ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timeSeriesData.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {data.last_modified_date as string}
                            </TableCell>
                            <TableCell className="bg-red-100 font-bold">
                              {formatCurrency(data.max)}
                            </TableCell>
                            <TableCell className="bg-blue-100 font-bold">
                              {formatCurrency(data.min)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(data.average)}
                            </TableCell>
                            {Array.from(
                              { length: 10 },
                              (_, i) => `ship${i + 1}`
                            )
                              .filter((shipName) =>
                                selectedShips.includes(shipName)
                              )
                              .map((shipName) => {
                                const shipValue = data[shipName] as number;
                                const colorClass = getColorClass(
                                  shipValue,
                                  data.max,
                                  data.min
                                );
                                return (
                                  <TableCell
                                    key={shipName}
                                    className={colorClass}
                                  >
                                    {data[shipName] === 0 ? (
                                      <span>データなし</span>
                                    ) : (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button className="underline text-blue-600 hover:text-blue-800">
                                            {formatCurrency(
                                              data[shipName] as number
                                            )}
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                          <div className="grid gap-4">
                                            <div className="space-y-2">
                                              <h4 className="font-medium leading-none">
                                                価格詳細
                                              </h4>
                                              <p className="text-sm text-muted-foreground">
                                                最終更新:{" "}
                                                {formatDate(
                                                  data["ships"][`${shipName}`][
                                                    "last_modified"
                                                  ] as string
                                                )}
                                              </p>
                                            </div>
                                            <div className="grid gap-2">
                                              <div className="grid grid-cols-2 items-center gap-4">
                                                <span className="text-sm font-medium">
                                                  価格
                                                </span>
                                              </div>
                                              {(
                                                data["ships"][`${shipName}`][
                                                  "price_list"
                                                ] as number[]
                                              )?.map(
                                                (
                                                  price: number,
                                                  priceIndex: number
                                                ) => (
                                                  <div
                                                    key={priceIndex}
                                                    className="grid grid-cols-2 items-center gap-4"
                                                  >
                                                    <span className="text-sm">
                                                      {formatCurrency(price)}
                                                    </span>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </TableCell>
                                );
                              })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);
ProductDialog.displayName = "ProductDialog";

const SummaryTab = ({ records }: { records: ProductRecord[] }) => {
  const totalProducts = records.length;
  const shipStats = Array.from({ length: 10 }, (_, i) => {
    const shipKey = `ship${i + 1}`;
    const maxCount = records.filter((r) => r[shipKey] === r.max).length;
    const minCount = records.filter((r) => r[shipKey] === r.min).length;
    return { name: shipKey, max: maxCount, min: minCount };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">
          表示している商品数: {totalProducts}
        </h2>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Ship毎の最高価格・最低価格の商品数
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChartRecharts data={shipStats}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="max" fill="#FCA5A5" name="最高価格" />
            <Bar dataKey="min" fill="#93C5FD" name="最低価格" />
          </BarChartRecharts>
        </ResponsiveContainer>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Ship毎の最高価格・最低価格の商品数（表）
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ship</TableHead>
              <TableHead>最高価格の商品数</TableHead>
              <TableHead>最低価格の商品数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipStats.map((stat, index) => (
              <TableRow key={index}>
                <TableCell>{stat.name}</TableCell>
                <TableCell>{stat.max}</TableCell>
                <TableCell>{stat.min}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export function ProductPriceRecord() {
  const [records, setRecords] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [supabaseUrl, setSupabaseUrl] = useState("");
  // const [supabaseApiKey, setSupabaseApiKey] = useState("");
  const [sortColumn, setSortColumn] =
    useState<keyof ProductRecord>("last_modified_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", { style: "decimal" }).format(amount);
  };

  const handleSort = (column: keyof ProductRecord) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const fetchData = async (
    search: string = "",
    last_modified: boolean = false
  ) => {
    if (!supabaseUrl || !supabaseApiKey) {
      setError("SupabaseのURLとAPIキーを入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    let endpoint = "";
    let options = {};
    if (last_modified) {
      endpoint = `${supabaseUrl}/rest/v1/rpc/get_max_last_modified_record`;
      options = {
        method: "GET",
        headers: {
          apikey: supabaseApiKey,
          Authorization: `Bearer ${supabaseApiKey}`,
          "Content-Type": "application/json",
        },
      };
    } else if (search) {
      endpoint = `${supabaseUrl}/rest/v1/rpc/get_latest_unique_products_by_partial_name`;
      const body = JSON.stringify({ search_term: search });

      options = {
        method: "POST",
        headers: {
          apikey: supabaseApiKey,
          Authorization: `Bearer ${supabaseApiKey}`,
          "Content-Type": "application/json",
        },
        body: body,
      };
    } else {
      endpoint = `${supabaseUrl}/rest/v1/rpc/get_latest_unique_products`;
      options = {
        method: "GET",
        headers: {
          apikey: supabaseApiKey,
          Authorization: `Bearer ${supabaseApiKey}`,
          "Content-Type": "application/json",
        },
      };
    }

    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRecords(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        "データの取得中にエラーが発生しました。詳細: " +
          (error instanceof Error ? error.message : String(error))
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchTerm);
  };

  const sortedRecords = useMemo(() => {
    const sortFn = (a: ProductRecord, b: ProductRecord) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "number" && typeof bValue === "number") {
        const diff = aValue - bValue;
        return sortDirection === "asc" ? diff : -diff;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        const collator = new Intl.Collator("ja-JP"); // ロケールを指定
        const diff = collator.compare(aValue, bValue);
        return sortDirection === "asc" ? diff : -diff;
      } else {
        // 数値と文字列が混在している場合の処理。必要に応じて適切なロジックを追加
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
      "最終更新日",
      "商品名",
      "最高価格",
      "最低価格",
      "平均価格",
      ...Array.from({ length: 10 }, (_, i) => `ship${i + 1}`),
    ];
    const csvContent = [
      headers.join(","),
      ...sortedRecords.map((record) =>
        [
          record.last_modified_date,
          record.product_name,
          record.max,
          record.min,
          record.average,
          ...Array.from({ length: 10 }, (_, i) => record[`ship${i + 1}`]),
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

  const getColorClass = (value: number, max: number, min: number) => {
    if (value === max) return "bg-red-100 font-bold";
    if (value === min) return "bg-blue-100 font-bold";
    const range = max - min;
    const normalizedValue = (value - min) / range;
    if (normalizedValue > 0.8) return "bg-red-50 font-semibold";
    if (normalizedValue < 0.2) return "bg-blue-50 font-semibold";
    return "";
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">商品価格一覧</h1>
      <div className="mb-4 space-y-4">
        {/* <div>
          <Label htmlFor="supabase-url">Supabase URL</Label>
          <Input
            id="supabase-url"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
          />
        </div>
        <div>
          <Label htmlFor="supabase-api-key">Supabase API Key</Label>
          <Input
            id="supabase-api-key"
            type="password"
            value={supabaseApiKey}
            onChange={(e) => setSupabaseApiKey(e.target.value)}
            placeholder="your-supabase-api-key"
          />
        </div> */}
        <Button onClick={() => fetchData("", true)} disabled={loading}>
          {loading ? "データを取得中..." : "最終更新日のデータを取得"}
        </Button>
      </div>
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="商品名を入力（部分一致）"
        />
        <Button type="submit" disabled={loading}>
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
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          データを取得中...
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort("last_modified_date")}>
                      最終更新日{" "}
                      {sortColumn === "last_modified_date" &&
                        (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("product_name")}>
                      商品名{" "}
                      {sortColumn === "product_name" &&
                        (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("max")}>
                      最高価格{" "}
                      {sortColumn === "max" &&
                        (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("min")}>
                      最低価格{" "}
                      {sortColumn === "min" &&
                        (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("average")}>
                      平均価格{" "}
                      {sortColumn === "average" &&
                        (sortDirection === "asc" ? "▲" : "▼")}
                    </TableHead>
                    {Array.from({ length: 10 }, (_, i) => (
                      <TableHead key={i}>ship{i + 1}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.last_modified_date}</TableCell>
                      <TableCell>
                        <ProductDialog
                          record={record}
                          // supabaseUrl={supabaseUrl}
                          // supabaseApiKey={supabaseApiKey}
                        />
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
                            <ShipPopover record={record} shipKey={shipKey} />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
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
              <div>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="mr-2"
                >
                  前へ
                </Button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-2"
                >
                  次へ
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="summary">
            <SummaryTab records={sortedRecords} />
          </TabsContent>
        </Tabs>
      ) : (
        <div>データがありません</div>
      )}
    </div>
  );
}
