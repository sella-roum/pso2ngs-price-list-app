import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ProductRecord } from "@/types/product";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon key is missing");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";
  const productName = searchParams.get("productName") ?? "";
  const groupName = searchParams.get("groupName") ?? "";
  const lastModified = searchParams.get("lastModified") === "true";

  try {
    let data: ProductRecord[] | null;
    let error;

    if (lastModified) {
      const rpcResult = await supabase.rpc("search_products_of_last_modified_date");
      data = rpcResult.data;
      error = rpcResult.error;
    } else {
      const rpcResult = await supabase.rpc("search_products", {
        search_category: category,
        search_product_name: productName,
        search_group_name: groupName,
      });
      data = rpcResult.data;
      error = rpcResult.error;
    }

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
