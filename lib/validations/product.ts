import { z } from "zod"

// 検索パラメータのバリデーションスキーマ
export const searchParamsSchema = z.object({
  category: z.string().optional(),
  productName: z.string().optional(),
  groupName: z.string().optional(),
  sortColumn: z
    .enum(["category", "last_modified_date", "product_name", "max", "min", "average", "group_name"])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  itemsPerPage: z.coerce.number().int().positive().optional(),
})

// 商品履歴取得のバリデーションスキーマ
export const productHistoryParamsSchema = z.object({
  productName: z.string().min(1, { message: "商品名は必須です" }),
})

// 分析パラメータのバリデーションスキーマ
export const analysisParamsSchema = z.object({
  targetType: z.enum(["product", "category"], {
    required_error: "分析対象タイプは必須です",
    invalid_type_error: "分析対象タイプは「product」または「category」である必要があります",
  }),
  targetName: z.string().min(1, { message: "分析対象名は必須です" }),
  period: z.enum(["7d", "30d", "all"], {
    required_error: "期間は必須です",
    invalid_type_error: "期間は「7d」、「30d」、または「all」である必要があります",
  }),
})

// 分析結果の型
export type AnalysisResult = {
  dates: string[]
  maxPrices: number[]
  minPrices: number[]
  avgPrices: number[]
  medianPrices: number[]
  dailyChanges: {
    date: string
    max: number
    min: number
    avg: number
    median: number
    maxChange: number
    minChange: number
    avgChange: number
    medianChange: number
  }[]
}
