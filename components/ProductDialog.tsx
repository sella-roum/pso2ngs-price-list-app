import React, { useState, useEffect } from "react"; // useEffect をインポート
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProductRecord, ShipKey } from "@/types/product"; // ShipKey をインポート
import { formatCurrency, getColorClass, formatDate } from "@/utils/formatters"; // formatDate をインポート
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile"; // モバイル判定フックをインポート
import { ProductCard } from "@/components/ProductCard"; // モバイル用カードをインポート

interface ProductDialogProps {
  record: ProductRecord; // 初期表示用のレコード
}

export const ProductDialog: React.FC<ProductDialogProps> = ({ record }) => {
  const [selectedShips, setSelectedShips] = useState<string[]>(
    Array.from({ length: 10 }, (_, i) => `ship${i + 1}`)
  );
  const [timeSeriesData, setTimeSeriesData] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const isMobile = useIsMobile(); // モバイル判定フックを使用

  // formatDate は utils からインポートするため不要
  // const formatDate = (dateString: string) => { ... };

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

  // グラフ用データ (変更なし)
  const chartData = timeSeriesData.map((historyRecord) => {
    const dataPoint: { [key: string]: string | number } = {
      // 日付のフォーマットを短縮形に変更 (グラフX軸用)
      date: formatDate(historyRecord.last_modified_date).split(" ")[0], // YYYY/MM/DD 形式
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
      // record.product_name を使用して履歴を取得
      const data = await fetchProductHistory(record.product_name);
      setTimeSeriesData(data);
      setHasLoadedData(true);
    } catch (error) {
      console.error("Error fetching product history:", error);
      setError("製品履歴の取得中にエラーが発生しました。");
      setTimeSeriesData([]); // エラー時はデータを空にする
    } finally {
      setLoading(false);
    }
  };

  // ダイアログが開かれたときにデータを読み込む
  useEffect(() => {
    // このuseEffectはダイアログの開閉とは別に、
    // record.product_name が変更された場合にも対応できるように残すか検討
    // 今回は onOpenChange で制御するためコメントアウト or 削除
    // if (record.product_name && !hasLoadedData) {
    //   loadProductHistory();
    // }
  }, [record.product_name, hasLoadedData]); // 依存配列を調整

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open && !hasLoadedData) {
          loadProductHistory();
        }
        // ダイアログが閉じられたときにデータをリセットする（任意）
        // if (!open) {
        //   setTimeSeriesData([]);
        //   setHasLoadedData(false);
        //   setError(null);
        // }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-normal text-left">
          {" "}
          {/* text-left を追加 */}
          {record.product_name}
        </Button>
      </DialogTrigger>
      {/* ダイアログのサイズ調整 */}
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full sm:max-w-[80vw] sm:max-h-[80vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record.product_name} の価格遷移</DialogTitle>
        </DialogHeader>
        {/* コンテンツ部分をflex-1とoverflow-y-autoでスクロール可能に */}
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-6 -ml-6">
          {" "}
          {/* パディング調整 */}
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
          ) : !hasLoadedData || timeSeriesData.length === 0 ? ( // hasLoadedDataもチェック
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
                        id={`dialog-ship-${shipName}`} // IDが重複しないようにプレフィックス追加
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
                  {/* <h3 className="text-lg font-semibold mb-2">価格遷移グラフ</h3> */}
                  <div className="h-[400px] sm:h-[50vh]">
                    {" "}
                    {/* 高さを調整 */}
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
                            stroke={`hsl(${index * 36}, 70%, 50%)`} // 色を調整しても良い
                            hide={!selectedShips.includes(shipName)}
                            dot={false} // 点を非表示に
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
                  {/* <h3 className="text-lg font-semibold mb-2">価格遷移表</h3> */}
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
                      {" "}
                      {/* table-container クラス適用 */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>日付</TableHead>
                            <TableHead>最高価格</TableHead>
                            <TableHead>最低価格</TableHead>
                            <TableHead>平均価格</TableHead>
                            {/* 選択されたShipのみ表示 */}
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
                              {/* 選択されたShipのみ表示 */}
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
                                      {/* ShipPopover を使用 */}
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
