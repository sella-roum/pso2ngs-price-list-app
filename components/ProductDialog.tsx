import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductRecord } from "@/types/product";
import { formatCurrency, getColorClass } from "@/utils/formatters";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
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
    Array.from({ length: 10 }, (_, i) => `ship${i + 1}`).forEach((shipName) => {
      dataPoint[shipName] = record[shipName] as number;
    });
    return dataPoint;
  });

  useEffect(() => {
    const loadProductHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductHistory(record.product_name);
        setTimeSeriesData(data);
      } catch (error) {
        console.error("Error fetching product history:", error);
        setError("製品履歴の取得中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    loadProductHistory();
  }, [record.product_name]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-normal">
          {record.product_name}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] max-h-[80vh] w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record.product_name}の価格遷移</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">データを読み込んでいます...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : timeSeriesData.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-gray-700">
              データがありません
            </p>
            <p className="text-sm text-gray-500">
              この商品の価格履歴は現在ありません。
            </p>
          </div>
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
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value)}
                      width={80}
                      style={{ fontSize: "0.8rem" }}
                    />
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
                            {formatDate(data.last_modified_date)}
                          </TableCell>
                          <TableCell className="bg-red-100 font-bold">
                            {formatCurrency(data.max)}
                          </TableCell>
                          <TableCell className="bg-blue-100 font-bold">
                            {formatCurrency(data.min)}
                          </TableCell>
                          <TableCell>{formatCurrency(data.average)}</TableCell>
                          {Array.from({ length: 10 }, (_, i) => `ship${i + 1}`)
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
                                  <ShipPopover
                                    record={data}
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
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
