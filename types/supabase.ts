export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      ProductPriceList: {
        Row: {
          id: number
          category: string
          img: string | null
          last_modified_date: string
          product_name: string
          max: number
          min: number
          average: number
          ships: Json
          group_name: string
          ship1: number | null
          ship2: number | null
          ship3: number | null
          ship4: number | null
          ship5: number | null
          ship6: number | null
          ship7: number | null
          ship8: number | null
          ship9: number | null
          ship10: number | null
        }
        Insert: {
          id?: number
          category: string
          img?: string | null
          last_modified_date: string
          product_name: string
          max: number
          min: number
          average: number
          ships: Json
          group_name: string
          ship1?: number | null
          ship2?: number | null
          ship3?: number | null
          ship4?: number | null
          ship5?: number | null
          ship6?: number | null
          ship7?: number | null
          ship8?: number | null
          ship9?: number | null
          ship10?: number | null
        }
        Update: {
          id?: number
          category?: string
          img?: string | null
          last_modified_date?: string
          product_name?: string
          max?: number
          min?: number
          average?: number
          ships?: Json
          group_name?: string
          ship1?: number | null
          ship2?: number | null
          ship3?: number | null
          ship4?: number | null
          ship5?: number | null
          ship6?: number | null
          ship7?: number | null
          ship8?: number | null
          ship9?: number | null
          ship10?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_distinct_categories: {
        Args: Record<string, never>
        Returns: { category: string }[]
      }
      get_distinct_group_names: {
        Args: Record<string, never>
        Returns: { group_name: string }[]
      }
      search_products: {
        Args: {
          search_category: string
          search_product_name: string
          search_group_name: string
        }
        Returns: Database["public"]["Tables"]["ProductPriceList"]["Row"][]
      }
      search_products_of_last_modified_date: {
        Args: Record<string, never>
        Returns: Database["public"]["Tables"]["ProductPriceList"]["Row"][]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
