"use server";

import { createClient } from "@supabase/supabase-js";
import { ProductRecord } from "@/types/product";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
// console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon key is missing");
  if (!supabaseUrl) console.error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!supabaseAnonKey)
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  throw new Error(
    "Supabase URL または Anon キーが設定されていません。環境変数を確認してください。"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchLatestProducts(
  category: string,
  productName: string,
  groupName: string
): Promise<ProductRecord[]> {
  const { data, error } = await supabase.rpc("search_products", {
    search_category: category,
    search_product_name: productName,
    search_group_name: groupName,
  });

  if (error) {
    console.error("最新の商品データの取得中にエラーが発生しました:", error);
    throw new Error("最新の商品データの取得に失敗しました");
  }

  if (!data || data.length === 0) {
    throw new Error("データが見つかりませんでした");
  }

  return data as ProductRecord[];
}

export async function fetchMaxLastModifiedRecord(): Promise<ProductRecord[]> {
  const { data, error } = await supabase.rpc(
    "search_products_of_last_modified_date"
  );

  if (error) {
    console.error("最終更新レコードの取得中にエラーが発生しました:", error);
    throw new Error("最終更新レコードの取得に失敗しました");
  }

  if (!data || data.length === 0) {
    throw new Error("データが見つかりませんでした");
  }

  return data as ProductRecord[];
}

// 商品履歴を取得
export async function fetchProductHistory(
  productName: string
): Promise<ProductRecord[]> {
  const { data, error } = await supabase
    .from("ProductPriceList")
    .select("*")
    .eq("product_name", productName)
    .order("last_modified_date", { ascending: true });

  if (error) {
    console.error("製品履歴の取得中にエラーが発生しました:", error);
    throw new Error("製品履歴の取得に失敗しました");
  }

  if (!data || data.length === 0) {
    throw new Error("データが見つかりませんでした");
  }

  return data as ProductRecord[];
}

// カテゴリのリストを取得
export async function fetchCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc("get_distinct_categories");

    if (error) throw new Error("Failed to fetch categories");

    return data.map((v: { category: string }) => v["category"]);
  } catch (error) {
    console.error("カテゴリの取得中にエラーが発生しました:", error);
    return [];
  }
}

// グループ名のリストを取得
export async function fetchGroupNames(): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc("get_distinct_group_names");

    if (error) throw new Error("Failed to fetch categories");

    return data.map((v: { group_name: string }) => v["group_name"]);
  } catch (error) {
    console.error("グループ名の取得中にエラーが発生しました:", error);
    return [];
  }
}
