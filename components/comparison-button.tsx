"use client";

import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { SplitSquareVertical, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export const ComparisonButton = () => {
  const { comparisonItems, clearComparison, compareItems } = useComparison();

  if (comparisonItems.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 md:bottom-6 right-6 z-50"
      >
        <div className="flex flex-col items-end space-y-2">
          <Button
            variant="default"
            size="lg"
            className="rounded-full shadow-lg"
            onClick={compareItems}
            disabled={comparisonItems.length !== 2}
          >
            <SplitSquareVertical className="mr-2 h-5 w-5" />
            比較する
            <Badge variant="secondary" className="ml-2 bg-primary-foreground text-primary" aria-live="polite">
              {comparisonItems.length}/2
            </Badge>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={clearComparison}
            aria-label="比較リストをクリア"
            title="比較リストをクリア"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
