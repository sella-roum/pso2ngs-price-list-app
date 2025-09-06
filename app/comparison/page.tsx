"use client";

import { useState, useEffect, useCallback } from "react";
import { useComparison } from "@/contexts/ComparisonContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/utils/formatters";
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { fetchProductHistory } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { ProductRecord, ShipsData } from "@/types/product";

// グラフ用のデータ型を定義
type MergedHistoryData = {
  date: string;
  [productName: string]: string | number | undefined;
};

const ComparisonPage = () => {
  const { comparisonItems, clearComparison } = useComparison();
  const [selectedShips, setSelectedShips] = useState(["ship1", "ship1"]);
  const [historyData, setHistoryData] = useState<MergedHistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const mergeHistoryData = useCallback(
    (history1: ProductRecord[], history2: ProductRecord[]): MergedHistoryData[] => {
      const dateMap = new Map<string, MergedHistoryData>();

      if (!comparisonItems || comparisonItems.length < 2) {
        return [];
      }

      // 最初の商品の履歴を追加
      history1.forEach((item) => {
        const date = formatDate(item.last_modified_date).split(" ")[0]; // 日付部分のみ
        dateMap.set(date, {
          date,
          [comparisonItems[0].product_name]: item.average,
        });
      });

      // 2番目の商品の履歴を追加
      history2.forEach((item) => {
        const date = formatDate(item.last_modified_date).split(" ")[0]; // 日付部分のみ
        if (dateMap.has(date)) {
          const existingData = dateMap.get(date);
          if (existingData) {
            existingData[comparisonItems[1].product_name] = item.average;
          }
        } else {
          dateMap.set(date, {
            date,
            [comparisonItems[1].product_name]: item.average,
          });
        }
      });

      // 日付でソート
      return Array.from(dateMap.values()).sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    },
    [comparisonItems],
  );

  useEffect(() => {
    if (comparisonItems.length !== 2) {
      router.push("/");
      return;
    }

    const fetchHistoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [item1History, item2History] = await Promise.all([
          fetchProductHistory(comparisonItems[0].product_name),
          fetchProductHistory(comparisonItems[1].product_name),
        ]);

        // 履歴データを日付でマージ
        const mergedData = mergeHistoryData(item1History, item2History);
        setHistoryData(mergedData);
      } catch (err) {
        console.error("履歴データの取得中にエラーが発生しました:", err);
        setError("履歴データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [comparisonItems, router, mergeHistoryData]);

  const handleShipChange = (index: number, value: string) => {
    setSelectedShips((prev) => {
      const newShips = [...prev];
      newShips[index] = value;
      return newShips;
    });
  };

  const getShipPrice = (item: ProductRecord, shipKey: string) => {
    if (item.ships && typeof item.ships === "object") {
      return (item.ships as ShipsData)[shipKey]?.price_list[0] || 0;
    }
    return 0;
  };

  if (comparisonItems.length !== 2) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertTitle>比較する商品が選択されていません</AlertTitle>
          <AlertDescription>商品一覧から2つの商品を選択して比較してください。</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          商品一覧に戻る
        </Button>
      </div>
    );
  }

  const [item1, item2] = comparisonItems;

  const priceDifference = getShipPrice(item1, selectedShips[0]) - getShipPrice(item2, selectedShips[1]);
  const priceDifferencePercentage =
    getShipPrice(item2, selectedShips[1]) > 0 ? (priceDifference / getShipPrice(item2, selectedShips[1])) * 100 : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          商品一覧に戻る
        </Button>
        <Button variant="outline" onClick={clearComparison}>
          比較をクリア
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold mb-6 text-gradient">商品比較</h1>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="details">詳細比較</TabsTrigger>
            <TabsTrigger value="history">価格履歴</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {[item1, item2].map((item, index) => (
                <motion.div
                  key={item.product_name}
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <Badge variant="outline" className="w-fit mb-2">
                        {item.category}
                      </Badge>
                      <CardTitle>{item.product_name}</CardTitle>
                      <CardDescription>グループ: {item.group_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">最終更新日:</p>
                            <p>{formatDate(item.last_modified_date)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">最高価格:</p>
                            <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(item.max)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">最低価格:</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(item.min)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">平均価格:</p>
                            <p className="font-medium">{formatCurrency(item.average)}</p>
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          {item.img ? (
                            <div className="w-32 h-32 relative overflow-hidden rounded-lg">
                              <Image
                                src={item.img || "/placeholder.svg"}
                                alt={item.product_name}
                                width={128}
                                height={128}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                              <p className="text-muted-foreground">No Image</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Ship選択:</p>
                        <Select
                          onValueChange={(value) => handleShipChange(index, value)}
                          defaultValue={selectedShips[index]}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Shipを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {item.ships &&
                              typeof item.ships === "object" &&
                              Object.keys(item.ships).map((shipKey) => (
                                <SelectItem key={shipKey} value={shipKey}>
                                  {shipKey}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="mt-2 font-bold">
                          選択Ship価格: {formatCurrency(getShipPrice(item, selectedShips[index]))}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>価格比較</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">価格差</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>絶対差額:</span>
                          <span className={priceDifference > 0 ? "text-red-600" : "text-blue-600"}>
                            {formatCurrency(Math.abs(priceDifference))}
                            {priceDifference > 0 ? " (高い)" : " (安い)"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>相対差額 (%):</span>
                          <span className={priceDifferencePercentage > 0 ? "text-red-600" : "text-blue-600"}>
                            {Math.abs(priceDifferencePercentage).toFixed(2)}%
                            {priceDifferencePercentage > 0 ? " (高い)" : " (安い)"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">比較結果</h3>
                      <p className="text-lg">
                        <span className="font-bold">{item1.product_name}</span> は
                        <span className="font-bold"> {item2.product_name}</span> より
                        <span className={`font-bold ${priceDifference > 0 ? "text-red-600" : "text-blue-600"}`}>
                          {" "}
                          {formatCurrency(Math.abs(priceDifference))} ({Math.abs(priceDifferencePercentage).toFixed(2)}
                          %)
                          {priceDifference > 0 ? " 高い" : " 安い"}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>詳細比較</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-2 border-b">項目</th>
                        <th className="text-left p-2 border-b">{item1.product_name}</th>
                        <th className="text-left p-2 border-b">{item2.product_name}</th>
                        <th className="text-left p-2 border-b">差異</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-b">カテゴリ</td>
                        <td className="p-2 border-b">{item1.category}</td>
                        <td className="p-2 border-b">{item2.category}</td>
                        <td className="p-2 border-b">{item1.category === item2.category ? "同じ" : "異なる"}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b">グループ名</td>
                        <td className="p-2 border-b">{item1.group_name}</td>
                        <td className="p-2 border-b">{item2.group_name}</td>
                        <td className="p-2 border-b">{item1.group_name === item2.group_name ? "同じ" : "異なる"}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b">最高価格</td>
                        <td className="p-2 border-b">{formatCurrency(item1.max)}</td>
                        <td className="p-2 border-b">{formatCurrency(item2.max)}</td>
                        <td className="p-2 border-b">
                          <span className={item1.max > item2.max ? "text-red-600" : "text-blue-600"}>
                            {formatCurrency(Math.abs(item1.max - item2.max))}
                            {item1.max > item2.max ? " (高い)" : " (安い)"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b">最低価格</td>
                        <td className="p-2 border-b">{formatCurrency(item1.min)}</td>
                        <td className="p-2 border-b">{formatCurrency(item2.min)}</td>
                        <td className="p-2 border-b">
                          <span className={item1.min > item2.min ? "text-red-600" : "text-blue-600"}>
                            {formatCurrency(Math.abs(item1.min - item2.min))}
                            {item1.min > item2.min ? " (高い)" : " (安い)"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b">平均価格</td>
                        <td className="p-2 border-b">{formatCurrency(item1.average)}</td>
                        <td className="p-2 border-b">{formatCurrency(item2.average)}</td>
                        <td className="p-2 border-b">
                          <span className={item1.average > item2.average ? "text-red-600" : "text-blue-600"}>
                            {formatCurrency(Math.abs(item1.average - item2.average))}
                            {item1.average > item2.average ? " (高い)" : " (安い)"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b">選択Ship価格</td>
                        <td className="p-2 border-b">
                          {selectedShips[0]}: {formatCurrency(getShipPrice(item1, selectedShips[0]))}
                        </td>
                        <td className="p-2 border-b">
                          {selectedShips[1]}: {formatCurrency(getShipPrice(item2, selectedShips[1]))}
                        </td>
                        <td className="p-2 border-b">
                          <span className={priceDifference > 0 ? "text-red-600" : "text-blue-600"}>
                            {formatCurrency(Math.abs(priceDifference))}
                            {priceDifference > 0 ? " (高い)" : " (安い)"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>価格履歴</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">履歴データを読み込み中...</span>
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertTitle>エラー</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : historyData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">履歴データがありません</p>
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={item1.product_name}
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name={item1.product_name}
                        />
                        <Line type="monotone" dataKey={item2.product_name} stroke="#82ca9d" name={item2.product_name} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ComparisonPage;
