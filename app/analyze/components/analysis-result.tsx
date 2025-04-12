"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { fetchProductAnalysisData } from "@/app/actions";
import { formatCurrency } from "@/utils/formatters";
import type { AnalysisResult } from "@/lib/validations/product";

export function AnalysisResult() {
  const searchParams = useSearchParams();
  const targetType = searchParams.get("targetType") as "product" | "category";
  const targetName = searchParams.get("targetName");
  const period = searchParams.get("period") as "7d" | "30d" | "all";

  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!targetType || !targetName || !period) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchProductAnalysisData(
          targetType,
          targetName,
          period
        );
        setAnalysisData(data);
      } catch (error) {
        console.error("分析データの取得中にエラーが発生しました:", error);
        setError(
          error instanceof Error
            ? error.message
            : "分析データの取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetType, targetName, period]);

  // パラメータがない場合は初期メッセージを表示;
  if (!targetType || !targetName || !period) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          分析条件を設定して「分析実行」ボタンをクリックしてください。
        </p>
      </div>
    );
  }

  if (loading) {
    // ローディング表示は Suspense fallback でカバーされるため、
    // このコンポーネント内のローディング表示は削除しても良いが、
    // より細かい制御が必要な場合は残す
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">データを分析中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysisData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          分析条件を設定して「分析実行」ボタンをクリックしてください。
        </p>
      </div>
    );
  }

  // グラフ用のデータ整形
  const chartData = analysisData.dates.map((date, index) => ({
    date,
    最高価格: analysisData.maxPrices[index],
    最低価格: analysisData.minPrices[index],
    平均価格: analysisData.avgPrices[index],
    中央値: analysisData.medianPrices[index],
  }));

  return (
    <Tabs defaultValue="chart">
      <TabsList>
        <TabsTrigger value="chart">グラフ</TabsTrigger>
        <TabsTrigger value="table">表</TabsTrigger>
      </TabsList>

      <TabsContent value="chart" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="最高価格"
                    stroke="#ef4444"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="最低価格" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="平均価格" stroke="#10b981" />
                  <Line
                    type="monotone"
                    dataKey="中央値"
                    stroke="#8b5cf6"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="table" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>最高価格</TableHead>
                    <TableHead>最低価格</TableHead>
                    <TableHead>平均価格</TableHead>
                    <TableHead>中央値</TableHead>
                    <TableHead>前日比(最高)</TableHead>
                    <TableHead>前日比(最低)</TableHead>
                    <TableHead>前日比(平均)</TableHead>
                    <TableHead>前日比(中央値)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisData.dailyChanges.map((item) => (
                    <TableRow key={item.date}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{formatCurrency(item.max)}</TableCell>
                      <TableCell>{formatCurrency(item.min)}</TableCell>
                      <TableCell>{formatCurrency(item.avg)}</TableCell>
                      <TableCell>{formatCurrency(item.median)}</TableCell>
                      <TableCell
                        className={
                          item.maxChange > 0
                            ? "text-red-500"
                            : item.maxChange < 0
                            ? "text-green-500"
                            : ""
                        }
                      >
                        {item.maxChange !== 0
                          ? formatCurrency(item.maxChange)
                          : "-"}
                      </TableCell>
                      <TableCell
                        className={
                          item.minChange > 0
                            ? "text-red-500"
                            : item.minChange < 0
                            ? "text-green-500"
                            : ""
                        }
                      >
                        {item.minChange !== 0
                          ? formatCurrency(item.minChange)
                          : "-"}
                      </TableCell>
                      <TableCell
                        className={
                          item.avgChange > 0
                            ? "text-red-500"
                            : item.avgChange < 0
                            ? "text-green-500"
                            : ""
                        }
                      >
                        {item.avgChange !== 0
                          ? formatCurrency(item.avgChange)
                          : "-"}
                      </TableCell>
                      <TableCell
                        className={
                          item.medianChange > 0
                            ? "text-red-500"
                            : item.medianChange < 0
                            ? "text-green-500"
                            : ""
                        }
                      >
                        {item.medianChange !== 0
                          ? formatCurrency(item.medianChange)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
