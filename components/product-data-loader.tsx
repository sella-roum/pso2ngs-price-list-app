import { ProductPriceRecord } from "@/components/ProductPriceRecord";
import {
  fetchMaxLastModifiedRecord,
  fetchCategories,
  fetchGroupNames,
} from "@/app/actions";

// このコンポーネントはサーバーコンポーネントとして動作します
export async function ProductDataLoader() {
  // Promise.all を使用して、複数の非同期処理を並列で実行
  // エラーが発生した場合、このコンポーネントがエラーをスローし、
  // Error Boundary (app/error.tsx) がキャッチします。
  const [initialProducts, initialCategories, initialGroupNames] =
    await Promise.all([
      fetchMaxLastModifiedRecord(),
      fetchCategories(),
      fetchGroupNames(),
    ]);

  // データ取得が成功した場合、ProductPriceRecord をレンダリング
  return (
    <ProductPriceRecord
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialGroupNames={initialGroupNames}
    />
  );
}
