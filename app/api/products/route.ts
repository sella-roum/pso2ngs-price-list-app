import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon key is missing")
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || ""
  const productName = searchParams.get("productName") || ""
  const groupName = searchParams.get("groupName") || ""
  const lastModified = searchParams.get("lastModified") === "true"

  try {
    let data
    if (lastModified) {
      const { data: result, error } = await supabase.rpc("search_products_of_last_modified_date")
      if (error) throw error
      data = result
    } else {
      const { data: result, error } = await supabase.rpc("search_products", {
        search_category: category,
        search_product_name: productName,
        search_group_name: groupName,
      })
      if (error) throw error
      data = result
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
