import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon key is missing");
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function GET() {
  try {
    const { data, error } = await supabase.rpc("get_distinct_categories");

    console.log({ data });
    if (error) throw error;

    const uniqueCategories = [...new Set(data.map((item) => item.category))];
    return NextResponse.json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
