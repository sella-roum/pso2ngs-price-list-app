export type ShipData = {
  price_list: number[]
  last_modified: string
}

export type ShipsData = {
  [shipName: string]: ShipData
}

export interface ProductRecord {
  id: number
  category: string
  img: string | null
  last_modified_date: string
  product_name: string
  max: number
  min: number
  average: number
  ships: ShipsData
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

export type ShipKey = `ship${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`

export type SortColumn = keyof ProductRecord
export type SortDirection = "asc" | "desc"

export interface ProductFilterParams {
  category?: string
  productName?: string
  groupName?: string
  sortColumn?: SortColumn
  sortDirection?: SortDirection
  page?: number
  itemsPerPage?: number
}
