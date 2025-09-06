import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// 環境変数の存在チェック
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

// サーバーサイド専用のSupabaseクライアントを作成
export const createServerSupabaseClient = () => {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
};
