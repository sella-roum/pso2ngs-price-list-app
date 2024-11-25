import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductRecord } from "@/types/product";
// import { formatCurrency } from "@/utils/formatters";
import {
  BarChart as BarChartRecharts,
  Bar,
  XAxis,
  YAxis,
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

interface SummaryTabProps {
  records: ProductRecord[];
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ records }) => {
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
