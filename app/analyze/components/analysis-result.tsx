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
import { formatCurrency, formatShortDate } from "@/utils/formatters";
// AnalysisResult 型と ProductRecord 型をインポート
import type {
  AnalysisResult,
  // DailyAnalysis,
  // ProductSummary,
} from "@/lib/validations/product";
import type { ProductRecord } from "@/types/product"; // ProductRecord 型をインポート
import Image from "next/image";
// ProductDialog をインポート
import { ProductDialog } from "@/components/ProductDialog";

export function AnalysisResult() {
  const searchParams = useSearchParams();
  const targetType = searchParams.get("targetType") as
    | "product"
    | "category"
    | null;
  const targetName = searchParams.get("targetName");
  const period = searchParams.get("period") as "7d" | "30d" | "all" | null;

  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!targetType || !targetName || !period) {
        setAnalysisData(null);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      setAnalysisData(null);
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

  if (
    !analysisData ||
    (!analysisData.daily_trends.length && !analysisData.product_summary.length)
  ) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          指定された条件の分析データが見つかりませんでした。
        </p>
      </div>
    );
  }

  // グラフ用のデータ整形
  const chartData = analysisData.daily_trends.map((item) => ({
    date: formatShortDate(item.date),
    最高価格: item.max_price,
    最低価格: item.min_price,
    平均価格: item.avg_price,
    中央値: item.median_price,
  }));

  // 前日比をフォーマットする関数
  const formatChangePercent = (value: number | null): string => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  // 期間全体の変動率をフォーマット
  const formatPeriodChangePercent = (value: number | null): string => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <Tabs defaultValue="daily-chart">
      <TabsList>
        <TabsTrigger value="daily-chart">日毎トレンド (グラフ)</TabsTrigger>
        <TabsTrigger value="daily-table">日毎トレンド (表)</TabsTrigger>
        {analysisData.product_summary.length > 0 && (
          <TabsTrigger value="product-summary">商品別サマリー</TabsTrigger>
        )}
      </TabsList>

      {/* --- 日毎トレンド (グラフ) --- */}
      <TabsContent value="daily-chart" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[400px]">
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
                    formatter={(value, name) => [
                      formatCurrency(value as number),
                      name,
                    ]}
                    labelFormatter={(label) => `日付: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="最高価格"
                    stroke="#ef4444"
                    activeDot={{ r: 6 }}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="最低価格"
                    stroke="#3b82f6"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="平均価格"
                    stroke="#10b981"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="中央値"
                    stroke="#8b5cf6"
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* --- 日毎トレンド (表) --- */}
      <TabsContent value="daily-table" className="mt-4">
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
                  {analysisData.daily_trends.map((item) => (
                    <TableRow key={item.date}>
                      <TableCell>{formatShortDate(item.date)}</TableCell>
                      <TableCell>
                        {formatCurrency(item.max_price ?? 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.min_price ?? 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.avg_price ?? 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.median_price ?? 0)}
                      </TableCell>
                      <TableCell
                        className={
                          item.max_price_change_pct &&
                          item.max_price_change_pct > 0
                            ? "text-red-600"
                            : item.max_price_change_pct &&
                              item.max_price_change_pct < 0
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {formatChangePercent(item.max_price_change_pct)}
                      </TableCell>
                      <TableCell
                        className={
                          item.min_price_change_pct &&
                          item.min_price_change_pct > 0
                            ? "text-red-600"
                            : item.min_price_change_pct &&
                              item.min_price_change_pct < 0
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {formatChangePercent(item.min_price_change_pct)}
                      </TableCell>
                      <TableCell
                        className={
                          item.avg_price_change_pct &&
                          item.avg_price_change_pct > 0
                            ? "text-red-600"
                            : item.avg_price_change_pct &&
                              item.avg_price_change_pct < 0
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {formatChangePercent(item.avg_price_change_pct)}
                      </TableCell>
                      <TableCell
                        className={
                          item.median_price_change_pct &&
                          item.median_price_change_pct > 0
                            ? "text-red-600"
                            : item.median_price_change_pct &&
                              item.median_price_change_pct < 0
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {formatChangePercent(item.median_price_change_pct)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* --- 商品別サマリー --- */}
      {analysisData.product_summary.length > 0 && (
        <TabsContent value="product-summary" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>画像</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead>期間最高値</TableHead>
                      <TableHead>期間最低値</TableHead>
                      <TableHead>期間平均値</TableHead>
                      <TableHead>開始価格</TableHead>
                      <TableHead>終了価格</TableHead>
                      <TableHead>期間変動率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisData.product_summary.map((item) => {
                      // ProductDialog に渡すための ProductRecord オブジェクトを生成
                      const dialogRecord: ProductRecord = {
                        id: 0, // ダミーID
                        product_name: item.product_name,
                        img: item.img,
                        category:
                          targetType === "category"
                            ? targetName ?? "不明"
                            : "不明", // カテゴリ分析時はtargetNameを使用
                        group_name: "不明", // DB関数で取得推奨
                        max: item.period_max ?? 0,
                        min: item.period_min ?? 0,
                        average: item.period_avg ?? 0,
                        last_modified_date: new Date().toISOString(), // ダミー
                        ships: {}, // ダミー
                        ship1: null,
                        ship2: null,
                        ship3: null,
                        ship4: null,
                        ship5: null,
                        ship6: null,
                        ship7: null,
                        ship8: null,
                        ship9: null,
                        ship10: null,
                      };

                      return (
                        <TableRow key={item.product_name}>
                          <TableCell>
                            {item.img ? (
                              <Image
                                src={item.img}
                                alt={item.product_name}
                                width={40}
                                height={40}
                                className="rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                No Img
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {/* ProductDialog を商品名部分に配置 */}
                            <ProductDialog record={dialogRecord} />
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.period_max ?? 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.period_min ?? 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.period_avg ?? 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.start_price ?? 0)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.end_price ?? 0)}
                          </TableCell>
                          <TableCell
                            className={
                              item.price_change_pct && item.price_change_pct > 0
                                ? "text-red-600"
                                : item.price_change_pct &&
                                  item.price_change_pct < 0
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {formatPeriodChangePercent(item.price_change_pct)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
}
