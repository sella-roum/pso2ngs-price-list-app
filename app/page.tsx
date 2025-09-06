import { Suspense } from "react";
import { ProductPriceRecord } from "@/components/ProductPriceRecord";
import { fetchMaxLastModifiedRecord, fetchCategories, fetchGroupNames, refreshData } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { ProductRecord } from "@/types/product";
import { ProductListSkeleton } from "@/components/product-list-skeleton";

export default async function Home() {
  let initialProducts: ProductRecord[] = [];
  let initialCategories: string[] = [];
  let initialGroupNames: string[] = [];
  let error = null;

  try {
    // Promise.all を使用して、複数の非同期処理を並列で実行
    [initialProducts, initialCategories, initialGroupNames] = await Promise.all([
      fetchMaxLastModifiedRecord(),
      fetchCategories(),
      fetchGroupNames(),
    ]);
  } catch (e) {
    console.error("初期データの取得中にエラーが発生しました:", e);
    // エラーメッセージを設定
    error = e instanceof Error ? e.message : "データの取得中に予期せぬエラーが発生しました";
  }

  return (
    <main className="mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gradient">商品価格一覧</h1>
      {error ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <form action={refreshData}>
            <Button type="submit" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              データを再取得する
            </Button>
          </form>
        </div>
      ) : (
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductPriceRecord
            initialProducts={initialProducts}
            initialCategories={initialCategories}
            initialGroupNames={initialGroupNames}
          />
        </Suspense>
      )}
    </main>
  );
}
