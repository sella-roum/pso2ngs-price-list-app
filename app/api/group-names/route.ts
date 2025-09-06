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
    const { data, error } = await supabase.rpc("get_distinct_group_names");

    if (error) throw error;
    if (!data || !Array.isArray(data)) {
      return NextResponse.json([]);
    }

    const uniqueGroupNames = [
      ...new Set(
        (data as Array<{ group_name: string | null }>)
          .map((item) => item.group_name)
          .filter((gn): gn is string => typeof gn === "string" && gn.length > 0),
      ),
    ];
    return NextResponse.json(uniqueGroupNames);
  } catch (error) {
    console.error("Error fetching group names:", error);
    return NextResponse.json({ error: "Failed to fetch group names" }, { status: 500 });
  }
}
