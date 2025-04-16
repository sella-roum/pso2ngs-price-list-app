"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { ProductRecord } from "@/types/product"
import {
  searchParamsSchema,
  productHistoryParamsSchema,
  analysisParamsSchema,
  type AnalysisResult,
  analysisResultSchema,
} from "@/lib/validations/product"
import { revalidatePath } from "next/cache"

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

// 分析データを取得 (DB関数呼び出し版)
export async function fetchProductAnalysisData(
  targetType: "product" | "category",
  targetName: string,
  period: "7d" | "30d" | "all",
): Promise<AnalysisResult> {
  try {
    const validatedParams = analysisParamsSchema.parse({
      targetType,
      targetName,
      period,
    })

    const supabase = createServerSupabaseClient()
    const endDate = new Date()
    let startDate: Date

    if (validatedParams.period === "7d") {
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 6)
    } else if (validatedParams.period === "30d") {
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 29)
    } else {
      startDate = new Date("1970-01-01")
    }

    const { data, error } = await supabase.rpc("analyze_price_trends", {
      target_type: validatedParams.targetType,
      target_name: validatedParams.targetName,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    })

    if (error) {
      console.error("分析データの取得中にエラーが発生しました (DB関数):", error)
      throw new Error(`分析データの取得に失敗しました: ${error.message}`)
    }

    if (!data || typeof data !== "object") {
      console.warn("DB関数から有効な分析データオブジェクトが返されませんでした。")
      return { daily_trends: [], product_summary: [] }
    }

    const validationResult = analysisResultSchema.safeParse(data)
    if (!validationResult.success) {
      console.error("DB関数の戻り値の形式が不正です:", validationResult.error)
      throw new Error("分析データの形式が不正です。")
    }
    return validationResult.data
  } catch (error) {
    console.error("fetchProductAnalysisData エラー:", error)
    if (error instanceof Error) {
      throw new Error(`分析処理中にエラーが発生しました: ${error.message}`)
    }
    throw new Error("分析処理中に不明なエラーが発生しました。")
  }
}

// キャッシュを更新
export async function refreshData(formData?: FormData): Promise<void> {
  // フォームデータは使用しないが、Server Actionとして使用するために引数を受け取る
  revalidatePath("/")
  // リダイレクトは必要ない - フォームのアクションとして使用すると自動的にページが更新される
}
