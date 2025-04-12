"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductRecord } from "@/types/product"
import { formatCurrency } from "@/utils/formatters"
import {
  BarChart as BarChartRecharts,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"

interface SummaryTabProps {
  records: ProductRecord[]
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ records }) => {
  const totalProducts = records.length

  // Ship統計
  const shipStats = Array.from({ length: 10 }, (_, i) => {
    const shipKey = `ship${i + 1}`
    const maxCount = records.filter((r) => r[shipKey] === r.max).length
    const minCount = records.filter((r) => r[shipKey] === r.min).length
    return { name: shipKey, max: maxCount, min: minCount }
  })

  // カテゴリ統計
  const categoryStats = records.reduce(
    (acc, record) => {
      const category = record.category
      if (!acc[category]) {
        acc[category] = { count: 0, totalPrice: 0 }
      }
      acc[category].count += 1
      acc[category].totalPrice += record.average
      return acc
    },
    {} as Record<string, { count: number; totalPrice: number }>,
  )

  const categoryData = Object.entries(categoryStats).map(([name, { count, totalPrice }]) => ({
    name,
    count,
    avgPrice: totalPrice / count,
  }))

  // 価格帯統計
  const priceRanges = [
    { range: "0-1,000", min: 0, max: 1000 },
    { range: "1,001-10,000", min: 1001, max: 10000 },
    { range: "10,001-100,000", min: 10001, max: 100000 },
    { range: "100,001-1,000,000", min: 100001, max: 1000000 },
    { range: "1,000,001+", min: 1000001, max: Number.POSITIVE_INFINITY },
  ]

  const priceRangeStats = priceRanges.map((range) => {
    const count = records.filter((r) => r.average >= range.min && r.average <= range.max).length
    return { name: range.range, value: count }
  })

  // 円グラフの色
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle>概要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <h3 className="text-lg font-medium mb-1">表示している商品数</h3>
                <p className="text-3xl font-bold">{totalProducts}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <h3 className="text-lg font-medium mb-1">平均価格</h3>
                <p className="text-3xl font-bold">
                  {formatCurrency(records.reduce((sum, r) => sum + r.average, 0) / totalProducts || 0)}
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <h3 className="text-lg font-medium mb-1">カテゴリ数</h3>
                <p className="text-3xl font-bold">{Object.keys(categoryStats).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Ship毎の最高価格・最低価格の商品数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
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
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別商品数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={(entry) => `${entry.name}: ${entry.count}件`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}件`, "商品数"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>価格帯別商品数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priceRangeStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={(entry) => `${entry.name}: ${entry.value}件`}
                    >
                      {priceRangeStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}件`, "商品数"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Ship別統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ship</TableHead>
                    <TableHead>最高価格の商品数</TableHead>
                    <TableHead>最低価格の商品数</TableHead>
                    <TableHead>最高/最低比率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell className="text-red-500">{stat.max}</TableCell>
                      <TableCell className="text-blue-500">{stat.min}</TableCell>
                      <TableCell>
                        {stat.max + stat.min > 0 ? `${((stat.max / (stat.max + stat.min)) * 100).toFixed(1)}%` : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
