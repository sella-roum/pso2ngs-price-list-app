"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { ProductRecord } from "@/types/product"
import { searchParamsSchema, productHistoryParamsSchema, analysisParamsSchema } from "@/lib/validations/product"
import { revalidatePath } from "next/cache"
import type { AnalysisResult } from "@/lib/validations/product"

// 最新の商品データを取得
export async function fetchLatestProducts(
  category?: string,
  productName?: string,
  groupName?: string,
): Promise<ProductRecord[]> {
  try {
    // 入力検証
    const validatedParams = searchParamsSchema.parse({
      category,
      productName,
      groupName,
    })

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.rpc("search_products", {
      search_category: validatedParams.category === "all" ? "" : validatedParams.category || "",
      search_product_name: validatedParams.productName || "",
      search_group_name: validatedParams.groupName === "all" ? "" : validatedParams.groupName || "",
    })

    if (error) {
      console.error("最新の商品データの取得中にエラーが発生しました:", error)
      throw new Error("最新の商品データの取得に失敗しました")
    }

    if (!data || data.length === 0) {
      return []
    }

    return data as ProductRecord[]
  } catch (error) {
    console.error("fetchLatestProducts エラー:", error)
    throw error
  }
}

// 最終更新日のレコードを取得
export async function fetchMaxLastModifiedRecord(): Promise<ProductRecord[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.rpc("search_products_of_last_modified_date")

    if (error) {
      console.error("最終更新レコードの取得中にエラーが発生しました:", error)
      throw new Error("最終更新レコードの取得に失敗しました")
    }

    if (!data || data.length === 0) {
      return []
    }

    return data as ProductRecord[]
  } catch (error) {
    console.error("fetchMaxLastModifiedRecord エラー:", error)
    throw error
  }
}

// 商品履歴を取得
export async function fetchProductHistory(productName: string): Promise<ProductRecord[]> {
  try {
    // 入力検証
    const validatedParams = productHistoryParamsSchema.parse({
      productName,
    })

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("ProductPriceList")
      .select("*")
      .eq("product_name", validatedParams.productName)
      .order("last_modified_date", { ascending: true })

    if (error) {
      console.error("製品履歴の取得中にエラーが発生しました:", error)
      throw new Error("製品履歴の取得に失敗しました")
    }

    if (!data || data.length === 0) {
      return []
    }

    return data as ProductRecord[]
  } catch (error) {
    console.error("fetchProductHistory エラー:", error)
    throw error
  }
}

// カテゴリのリストを取得
export async function fetchCategories(): Promise<string[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.rpc("get_distinct_categories")

    if (error) {
      console.error("カテゴリの取得中にエラーが発生しました:", error)
      throw new Error("カテゴリの取得に失敗しました")
    }

    return data.map((v: { category: string }) => v["category"])
  } catch (error) {
    console.error("fetchCategories エラー:", error)
    return []
  }
}

// グループ名のリストを取得
export async function fetchGroupNames(): Promise<string[]> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.rpc("get_distinct_group_names")

    if (error) {
      console.error("グループ名の取得中にエラーが発生しました:", error)
      throw new Error("グループ名の取得に失敗しました")
    }

    return data.map((v: { group_name: string }) => v["group_name"])
  } catch (error) {
    console.error("fetchGroupNames エラー:", error)
    return []
  }
}

// 分析データを取得
export async function fetchProductAnalysisData(
  targetType: "product" | "category",
  targetName: string,
  period: "7d" | "30d" | "all",
): Promise<AnalysisResult> {
  try {
    // 入力検証
    const validatedParams = analysisParamsSchema.parse({
      targetType,
      targetName,
      period,
    })

    const supabase = createServerSupabaseClient()

    // 日付範囲の計算
    const now = new Date()
    let startDate: Date | null = null

    if (validatedParams.period === "7d") {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (validatedParams.period === "30d") {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
    }

    let query

    if (validatedParams.targetType === "product") {
      // 商品の分析データを取得
      query = supabase
        .from("ProductPriceList")
        .select("*")
        .eq("product_name", validatedParams.targetName)
        .order("last_modified_date", { ascending: true })

      if (startDate) {
        query = query.gte("last_modified_date", startDate.toISOString())
      }
    } else {
      // カテゴリの分析データを取得
      query = supabase
        .from("ProductPriceList")
        .select("*")
        .eq("category", validatedParams.targetName)
        .order("last_modified_date", { ascending: true })

      if (startDate) {
        query = query.gte("last_modified_date", startDate.toISOString())
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("分析データの取得中にエラーが発生しました:", error)
      throw new Error("分析データの取得に失敗しました")
    }

    if (!data || data.length === 0) {
      throw new Error("分析データが見つかりませんでした")
    }

    // 日付ごとにデータをグループ化
    const groupedByDate = data.reduce(
      (acc, record) => {
        const date = record.last_modified_date.split("T")[0] // YYYY-MM-DD形式に変換
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(record)
        return acc
      },
      {} as Record<string, ProductRecord[]>,
    )

    // 日付の配列（ソート済み）
    const dates = Object.keys(groupedByDate).sort()

    // 各日付の統計値を計算
    const maxPrices: number[] = []
    const minPrices: number[] = []
    const avgPrices: number[] = []
    const medianPrices: number[] = []
    const dailyChanges = []

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]
      const records = groupedByDate[date]

      // その日の最大値、最小値、平均値を計算
      const maxPrice = Math.max(...records.map((r) => r.max))
      const minPrice = Math.min(...records.map((r) => r.min))

      // 平均値の計算
      const sum = records.reduce((acc, r) => acc + r.average, 0)
      const avgPrice = sum / records.length

      // 中央値の計算
      const sortedPrices = [...records.map((r) => r.average)].sort((a, b) => a - b)
      const midIndex = Math.floor(sortedPrices.length / 2)
      const medianPrice =
        sortedPrices.length % 2 === 0
          ? (sortedPrices[midIndex - 1] + sortedPrices[midIndex]) / 2
          : sortedPrices[midIndex]

      maxPrices.push(maxPrice)
      minPrices.push(minPrice)
      avgPrices.push(avgPrice)
      medianPrices.push(medianPrice)

      // 前日比の計算
      const dailyChange = {
        date,
        max: maxPrice,
        min: minPrice,
        avg: avgPrice,
        median: medianPrice,
        maxChange: i > 0 ? maxPrice - maxPrices[i - 1] : 0,
        minChange: i > 0 ? minPrice - minPrices[i - 1] : 0,
        avgChange: i > 0 ? avgPrice - avgPrices[i - 1] : 0,
        medianChange: i > 0 ? medianPrice - medianPrices[i - 1] : 0,
      }

      dailyChanges.push(dailyChange)
    }

    return {
      dates,
      maxPrices,
      minPrices,
      avgPrices,
      medianPrices,
      dailyChanges,
    }
  } catch (error) {
    console.error("fetchProductAnalysisData エラー:", error)
    throw error
  }
}

// キャッシュを更新
export async function refreshData(path = "/"): Promise<void> {
  revalidatePath(path)
}
