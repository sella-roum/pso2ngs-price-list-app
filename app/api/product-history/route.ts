import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon key is missing");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { searchParams } = new URL(request.url);
  const productName = searchParams.get("productName");

  if (!productName) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("ProductPriceList")
      .select("*")
      .eq("product_name", productName)
      .order("last_modified_date", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product history:", error);
    return NextResponse.json({ error: "Failed to fetch product history" }, { status: 500 });
  }
}
