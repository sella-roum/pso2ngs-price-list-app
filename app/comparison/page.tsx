"use client"

import { useState } from "react"
import { useComparison } from "@/contexts/ComparisonContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/utils/formatters"
import Image from "next/image"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const ComparisonPage = () => {
  const { comparisonItems } = useComparison()
  const [selectedShips, setSelectedShips] = useState(["ship1", "ship1"])

  if (comparisonItems.length !== 2) {
    return <div>比較する商品が2つ選択されていません。</div>
  }

  const [item1, item2] = comparisonItems

  const handleShipChange = (index: number, value: string) => {
    setSelectedShips((prev) => {
      const newShips = [...prev]
      newShips[index] = value
      return newShips
    })
  }

  const getShipPrice = (item: typeof item1, shipKey: string) => {
    return (item.ships as any)[shipKey]?.price_list[0] || 0
  }

  const priceDifference = getShipPrice(item1, selectedShips[0]) - getShipPrice(item2, selectedShips[1])
  const priceDifferencePercentage = (priceDifference / getShipPrice(item2, selectedShips[1])) * 100

  // 仮のデータ（実際にはAPIから取得する必要があります）
  const chartData = [
    { name: "1週間前", [item1.product_name]: 1000, [item2.product_name]: 1200 },
    { name: "1ヶ月前", [item1.product_name]: 1100, [item2.product_name]: 1150 },
    { name: "3ヶ月前", [item1.product_name]: 950, [item2.product_name]: 1100 },
    { name: "半年前", [item1.product_name]: 1050, [item2.product_name]: 1050 },
    { name: "1年前", [item1.product_name]: 900, [item2.product_name]: 1000 },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">商品比較</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {[item1, item2].map((item, index) => (
          <Card key={item.product_name}>
            <CardHeader>
              <CardTitle>{item.product_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>カテゴリ:</strong> {item.category}
                  </p>
                  <p>
                    <strong>グループ名:</strong> {item.group_name}
                  </p>
                  <p>
                    <strong>最終更新日:</strong> {item.last_modified_date}
                  </p>
                </div>
                <div>
                  {item.img && (
                    <div className="w-32 h-32 relative overflow-hidden ml-auto">
                      <Image
                        src={item.img}
                        alt={item.product_name}
                        width={128}
                        height={128}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Select onValueChange={(value) => handleShipChange(index, value)} defaultValue={selectedShips[index]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Shipを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(item.ships).map((shipKey) => (
                      <SelectItem key={shipKey} value={shipKey}>
                        {shipKey}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2">
                  <strong>現在価格:</strong> {formatCurrency(getShipPrice(item, selectedShips[index]))}
                </p>
                <p>
                  <strong>最高価格:</strong> {formatCurrency(item.max)}
                </p>
                <p>
                  <strong>最低価格:</strong> {formatCurrency(item.min)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>価格比較</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>価格差:</strong> {formatCurrency(Math.abs(priceDifference))} (
            {priceDifference > 0 ? "高い" : "安い"})
          </p>
          <p>
            <strong>価格差 (%):</strong> {priceDifferencePercentage.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>価格履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={item1.product_name} stroke="#8884d8" />
              <Line type="monotone" dataKey={item2.product_name} stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default ComparisonPage
