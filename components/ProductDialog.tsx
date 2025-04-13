import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // DialogClose, // DialogClose をインポート
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProductRecord, ShipKey } from "@/types/product";
import {
  formatCurrency,
  getColorClass,
  formatDate,
  formatShortDate,
} from "@/utils/formatters"; // formatShortDate もインポート
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  // X
} from "lucide-react"; // X アイコンをインポート
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ShipPopover } from "@/components/ShipPopover";
import { fetchProductHistory } from "@/app/actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils"; // cn ユーティリティをインポート

interface ProductDialogProps {
  record: ProductRecord;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({ record }) => {
  const [selectedShips, setSelectedShips] = useState<string[]>(
    Array.from({ length: 10 }, (_, i) => `ship${i + 1}`)
  );
  const [timeSeriesData, setTimeSeriesData] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const isMobile = useIsMobile();

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

  const chartData = timeSeriesData.map((historyRecord) => {
    const dataPoint: { [key: string]: string | number } = {
      date: formatShortDate(historyRecord.last_modified_date), // 短縮形を使用
    };
    (Array.from({ length: 10 }, (_, i) => `ship${i + 1}`) as ShipKey[]).forEach(
      (shipName) => {
        dataPoint[shipName] = historyRecord[shipName] as number;
      }
    );
    return dataPoint;
  });

  const loadProductHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductHistory(record.product_name);
      setTimeSeriesData(data);
      setHasLoadedData(true);
    } catch (error) {
      console.error("Error fetching product history:", error);
      setError("製品履歴の取得中にエラーが発生しました。");
      setTimeSeriesData([]);
    } finally {
      setLoading(false);
    }
  };

  // ダイアログが開かれたときにデータを読み込む
  useEffect(() => {
    // record.product_name が変更された場合にも対応 (任意)
    // if (record.product_name && hasLoadedData) {
    //   // 必要であればデータをリセットして再読み込み
    //   setTimeSeriesData([]);
    //   setHasLoadedData(false);
    //   loadProductHistory();
    // }
  }, [record.product_name]); // hasLoadedData を依存配列から削除

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open && !hasLoadedData) {
          loadProductHistory();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-normal text-left">
          {record.product_name}
        </Button>
      </DialogTrigger>
      {/* DialogContent のスタイルを修正 */}
      <DialogContent
        className={cn(
          "flex h-full w-full flex-col border-none bg-background p-0", // モバイルデフォルト: 全面表示、ボーダーなし、パディングなし
          "sm:inset-auto sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-[80vw]", // デスクトップ: 中央表示、サイズ制限
          "sm:rounded-lg sm:border sm:p-6" // デスクトップ: 角丸、ボーダー、パディング
        )}
      >
        {/* ヘッダー: モバイルでもパディングを持たせる */}
        <DialogHeader className="px-6 pt-6 sm:px-0 sm:pt-0">
          <DialogTitle>{record.product_name} の価格遷移</DialogTitle>
          {/* モバイル用に閉じるボタンをヘッダーに追加 */}
          {/* <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground sm:hidden">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose> */}
        </DialogHeader>
        {/* コンテンツ部分: パディングを適用し、スクロール可能に */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-0 sm:pb-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                データを読み込んでいます...
              </p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <Alert variant="destructive" className="w-full">
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : !hasLoadedData || timeSeriesData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center py-4">
              <div>
                <p className="text-lg font-semibold text-muted-foreground">
                  データがありません
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  この商品の価格履歴は現在登録されていません。
                </p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="graph" className="w-full mt-2">
              <TabsList>
                <TabsTrigger value="graph">グラフ</TabsTrigger>
                <TabsTrigger value="table">表</TabsTrigger>
              </TabsList>
              {/* Ship選択チェックボックス */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 my-4">
                {Array.from({ length: 10 }, (_, i) => `ship${i + 1}`).map(
                  (shipName) => (
                    <div key={shipName} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dialog-ship-${shipName}`}
                        checked={selectedShips.includes(shipName)}
                        onCheckedChange={() => handleShipToggle(shipName)}
                      />
                      <Label
                        htmlFor={`dialog-ship-${shipName}`}
                        className="text-sm font-normal"
                      >
                        {shipName}
                      </Label>
                    </div>
                  )
                )}
              </div>
              {/* グラフ表示 */}
              <TabsContent value="graph">
                <div className="mt-4">
                  <div className="h-[400px] sm:h-[45vh]">
                    {" "}
                    {/* 高さを少し調整 */}
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} tickMargin={5} />
                        <YAxis
                          tickFormatter={(value) => formatCurrency(value)}
                          width={80}
                          fontSize={12}
                        />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                          labelFormatter={(label) => `日付: ${label}`}
                        />
                        <Legend />
                        {Array.from(
                          { length: 10 },
                          (_, i) => `ship${i + 1}`
                        ).map((shipName, index) => (
                          <Line
                            key={shipName}
                            type="monotone"
                            dataKey={shipName}
                            stroke={`hsl(${index * 36}, 70%, 50%)`}
                            hide={!selectedShips.includes(shipName)}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
              {/* 表表示 (レスポンシブ対応) */}
              <TabsContent value="table">
                <div className="mt-4">
                  {isMobile ? (
                    // モバイル表示: ProductCard のリスト
                    <div className="space-y-4">
                      {timeSeriesData.map((historyRecord, index) => (
                        <ProductCard key={index} record={historyRecord} />
                      ))}
                    </div>
                  ) : (
                    // デスクトップ表示: テーブル
                    <div className="overflow-x-auto table-container">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>日付</TableHead>
                            <TableHead>最高価格</TableHead>
                            <TableHead>最低価格</TableHead>
                            <TableHead>平均価格</TableHead>
                            {Array.from(
                              { length: 10 },
                              (_, i) => `ship${i + 1}`
                            )
                              .filter((shipName) =>
                                selectedShips.includes(shipName)
                              )
                              .map((shipName) => (
                                <TableHead key={shipName}>{shipName}</TableHead>
                              ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {timeSeriesData.map((historyRecord, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {formatDate(historyRecord.last_modified_date)}
                              </TableCell>
                              <TableCell className="bg-red-100 dark:bg-red-900/30 font-bold">
                                {formatCurrency(historyRecord.max)}
                              </TableCell>
                              <TableCell className="bg-blue-100 dark:bg-blue-900/30 font-bold">
                                {formatCurrency(historyRecord.min)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(historyRecord.average)}
                              </TableCell>
                              {Array.from(
                                { length: 10 },
                                (_, i) => `ship${i + 1}` as ShipKey
                              )
                                .filter((shipName) =>
                                  selectedShips.includes(shipName)
                                )
                                .map((shipName) => {
                                  const shipValue = historyRecord[
                                    shipName
                                  ] as number;
                                  const colorClass = getColorClass(
                                    shipValue,
                                    historyRecord.max,
                                    historyRecord.min
                                  );
                                  return (
                                    <TableCell
                                      key={shipName}
                                      className={colorClass}
                                    >
                                      <ShipPopover
                                        record={historyRecord}
                                        shipKey={shipName}
                                      />
                                    </TableCell>
                                  );
                                })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
