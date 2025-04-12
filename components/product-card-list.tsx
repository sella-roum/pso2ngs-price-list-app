import type { ProductRecord } from "@/types/product"
import { ProductCard } from "@/components/ProductCard"

interface ProductCardListProps {
  records: ProductRecord[]
}

export function ProductCardList({ records }: ProductCardListProps) {
  return (
    <div className="space-y-4">
      {records.map((record, index) => (
        <ProductCard key={index} record={record} />
      ))}
    </div>
  )
}
