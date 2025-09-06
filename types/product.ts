// Json 型は supabase.ts からインポートするか、ここで定義します
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ShipData = {
  price_list: number[];
  last_modified: string;
};

export type ShipsData = {
  [key in ShipKey]?: ShipData;
};

// Supabaseの型を継承するのではなく、アプリケーションで実際に使用するプロパティを明示的に定義します。
// これにより、RPCの戻り値など、一部の列しか返さないデータソースとも互換性が保たれます。
export interface ProductRecord {
  // RPCとテーブルの両方から返される共通の必須プロパティ
  product_name: string;
  last_modified_date: string;
  max: number;
  min: number;
  average: number;
  ships: ShipsData | Json;

  // nullを許容するプロパティ
  category: string | null;
  img: string | null;
  group_name: string | null;
  ship1: number | null;
  ship2: number | null;
  ship3: number | null;
  ship4: number | null;
  ship5: number | null;
  ship6: number | null;
  ship7: number | null;
  ship8: number | null;
  ship9: number | null;
  ship10: number | null;

  // テーブルから直接取得した場合にのみ存在する可能性のあるプロパティ（オプショナルにする）
  id?: number;
  created_at?: string;
}

export type ShipKey = `ship${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;

export type SortColumn = "category" | "last_modified_date" | "product_name" | "max" | "min" | "average" | "group_name";
export type SortDirection = "asc" | "desc";

export interface ProductFilterParams {
  category?: string;
  productName?: string;
  groupName?: string;
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
  page?: number;
  itemsPerPage?: number;
}
