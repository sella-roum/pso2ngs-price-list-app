import { z } from "zod";

// 検索パラメータのバリデーションスキーマ
export const searchParamsSchema = z
  .object({
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
  .strip();

// 商品履歴取得のバリデーションスキーマ
export const productHistoryParamsSchema = z.object({
  productName: z.string().min(1, { message: "商品名は必須です" }),
});

// 分析パラメータのバリデーションスキーマ
export const analysisParamsSchema = z.object({
  targetType: z.enum(["product", "category"], {
    message: "分析対象は「商品名」または「カテゴリ」である必要があります。",
  }),
  targetName: z.string().min(1, { message: "分析対象名は必須です" }),
  period: z.enum(["7d", "30d", "all"], {
    message: "期間は「7d」「30d」「all」のいずれかである必要があります。",
  }),
});

// DB関数 analyze_price_trends の日毎トレンド部分の型
export type DailyAnalysis = {
  date: string;
  max_price: number | null;
  min_price: number | null;
  avg_price: number | null;
  median_price: number | null;
  max_price_change_pct: number | null;
  min_price_change_pct: number | null;
  avg_price_change_pct: number | null;
  median_price_change_pct: number | null;
};

// DB関数 analyze_price_trends の商品サマリー部分の型
export type ProductSummary = {
  product_name: string;
  img: string | null;
  period_max: number | null;
  period_min: number | null;
  period_avg: number | null;
  start_price: number | null;
  end_price: number | null;
  price_change_pct: number | null;
};

// DB関数 analyze_price_trends の全体の戻り値の型
export type AnalysisResult = {
  daily_trends: DailyAnalysis[];
  product_summary: ProductSummary[];
};

// (オプション) Zodスキーマ
export const dailyAnalysisSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  max_price: z.number().nullable(),
  min_price: z.number().nullable(),
  avg_price: z.number().nullable(),
  median_price: z.number().nullable(),
  max_price_change_pct: z.number().nullable(),
  min_price_change_pct: z.number().nullable(),
  avg_price_change_pct: z.number().nullable(),
  median_price_change_pct: z.number().nullable(),
});

export const productSummarySchema = z.object({
  product_name: z.string(),
  img: z.string().nullable(),
  period_max: z.number().nullable(),
  period_min: z.number().nullable(),
  period_avg: z.number().nullable(),
  start_price: z.number().nullable(),
  end_price: z.number().nullable(),
  price_change_pct: z.number().nullable(),
});

export const analysisResultSchema = z.object({
  daily_trends: z.array(dailyAnalysisSchema),
  product_summary: z.array(productSummarySchema),
});

// fetchProductAnalysisData の戻り値型 (配列)
export type AnalysisData = DailyAnalysis[];
