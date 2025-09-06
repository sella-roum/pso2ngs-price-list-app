import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300; // 5分キャッシュ

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon key is missing");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.rpc("get_distinct_categories");

    if (error) throw error;
    if (!data || !Array.isArray(data)) {
      return NextResponse.json([]);
    }

    const uniqueCategories = [
      ...new Set(
        (data as Array<{ category: string | null }>)
          .map((item) => item.category)
          .filter((c): c is string => typeof c === "string" && c.length > 0),
      ),
    ];
    return NextResponse.json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
