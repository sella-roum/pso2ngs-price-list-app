import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProductRecord, ShipKey } from "@/types/product";
import { formatCurrency, getColorClass, formatDate } from "@/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShipPopover } from "@/components/ShipPopover";
import { fetchProductHistory } from "@/app/actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductCard } from "@/components/ProductCard";

interface ProductDialogProps {
  record: ProductRecord;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({ record }) => {
  const [selectedShips, setSelectedShips] = useState<ShipKey[]>(
    Array.from({ length: 10 }, (_, i) => `ship${i + 1}` as ShipKey),
  );
  const [timeSeriesData, setTimeSeriesData] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const isMobile = useIsMobile();

  const handleShipToggle = (shipName: ShipKey) => {
    setSelectedShips((prev) =>
      prev.includes(shipName)
        ? prev.filter((ship) => ship !== shipName)
        : [...prev, shipName].sort((a, b) => {
            const aNum = parseInt(a.replace("ship", ""));
            const bNum = parseInt(b.replace("ship", ""));
            return aNum - bNum;
          }),
    );
  };

  const chartData = useMemo(
    () =>
      timeSeriesData.map((historyRecord) => {
        const dataPoint: { [key: string]: string | number | null } = {
          date: formatDate(historyRecord.last_modified_date)?.split(" ")[0] ?? "",
        };
        (Array.from({ length: 10 }, (_, i) => `ship${i + 1}`) as ShipKey[]).forEach((shipName) => {
          dataPoint[shipName] = historyRecord[shipName];
        });
        return dataPoint;
      }),
    [timeSeriesData],
  );

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

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open && !hasLoadedData) {
          void loadProductHistory();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-normal text-left">
          {record.product_name}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full sm:max-w-[80vw] sm:max-h-[80vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record.product_name} の価格遷移</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-6 -ml-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">データを読み込んでいます...</p>
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
                <p className="text-lg font-semibold text-muted-foreground">データがありません</p>
                <p className="text-sm text-muted-foreground mt-1">この商品の価格履歴は現在登録されていません。</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="graph" className="w-full mt-2">
              <TabsList>
                <TabsTrigger value="graph">グラフ</TabsTrigger>
                <TabsTrigger value="table">表</TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap gap-x-4 gap-y-2 my-4">
                {(Array.from({ length: 10 }, (_, i) => `ship${i + 1}`) as ShipKey[]).map((shipName) => (
                  <div key={shipName} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dialog-ship-${shipName}`}
                      checked={selectedShips.includes(shipName)}
                      onCheckedChange={() => handleShipToggle(shipName)}
                    />
                    <Label htmlFor={`dialog-ship-${shipName}`} className="text-sm font-normal">
                      {shipName}
                    </Label>
                  </div>
                ))}
              </div>
              <TabsContent value="graph">
                <div className="mt-4">
                  <div className="h-[400px] sm:h-[50vh]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} tickMargin={5} />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} width={80} fontSize={12} />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                          labelFormatter={(label) => `日付: ${label}`}
                        />
                        <Legend />
                        {(Array.from({ length: 10 }, (_, i) => `ship${i + 1}`) as ShipKey[]).map((shipName, index) => (
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
              <TabsContent value="table">
                <div className="mt-4">
                  {isMobile ? (
                    <div className="space-y-4">
                      {timeSeriesData.map((historyRecord) => (
                        <ProductCard
                          key={`${historyRecord.product_name}-${historyRecord.last_modified_date}`}
                          record={historyRecord}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto table-container">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>日付</TableHead>
                            <TableHead>最高価格</TableHead>
                            <TableHead>最低価格</TableHead>
                            <TableHead>平均価格</TableHead>
                            {Array.from({ length: 10 }, (_, i) => `ship${i + 1}` as ShipKey)
                              .filter((shipName) => selectedShips.includes(shipName))
                              .map((shipName) => (
                                <TableHead key={shipName}>{shipName}</TableHead>
                              ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {timeSeriesData.map((historyRecord) => (
                            <TableRow key={historyRecord.last_modified_date}>
                              <TableCell>{formatDate(historyRecord.last_modified_date)}</TableCell>
                              <TableCell className="bg-red-100 dark:bg-red-900/30 font-bold">
                                {formatCurrency(historyRecord.max)}
                              </TableCell>
                              <TableCell className="bg-blue-100 dark:bg-blue-900/30 font-bold">
                                {formatCurrency(historyRecord.min)}
                              </TableCell>
                              <TableCell>{formatCurrency(historyRecord.average)}</TableCell>
                              {Array.from({ length: 10 }, (_, i) => `ship${i + 1}` as ShipKey)
                                .filter((shipName) => selectedShips.includes(shipName))
                                .map((shipName) => {
                                  const shipValue = historyRecord[shipName];
                                  const colorClass = getColorClass(shipValue, historyRecord.max, historyRecord.min);
                                  return (
                                    <TableCell key={shipName} className={colorClass}>
                                      <ShipPopover record={historyRecord} shipKey={shipName} />
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
