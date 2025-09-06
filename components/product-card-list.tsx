"use client";

import type { ProductRecord } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";

interface ProductCardListProps {
  records: ProductRecord[];
}

export function ProductCardList({ records }: ProductCardListProps) {
  return (
    <>
      {records.map((record, index) => (
        <motion.div
          key={record.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ProductCard record={record} />
        </motion.div>
      ))}
    </>
  );
}
