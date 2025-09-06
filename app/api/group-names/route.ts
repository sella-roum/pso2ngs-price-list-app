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
    const { data, error } = await supabase.rpc("get_distinct_group_names");

    console.log({ data });
    if (error) throw error;
    if (!data) {
      return NextResponse.json([]);
    }

    const uniqueGroupNames = [...new Set(data.map((item: { group_name: string }) => item.group_name))];
    return NextResponse.json(uniqueGroupNames);
  } catch (error) {
    console.error("Error fetching group names:", error);
    return NextResponse.json({ error: "Failed to fetch group names" }, { status: 500 });
  }
}
