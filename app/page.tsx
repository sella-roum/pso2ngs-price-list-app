import { ProductPriceRecord } from "@/components/ProductPriceRecord";
import {
  fetchMaxLastModifiedRecord,
  fetchCategories,
  fetchGroupNames,
} from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductRecord } from "@/types/product";

export default async function Home() {
  let initialProducts: ProductRecord[] = [];
  let initialCategories: string[] = [];
  let initialGroupNames: string[] = [];
  let error = null;

  try {
    initialProducts = await fetchMaxLastModifiedRecord();
    initialCategories = await fetchCategories();
    initialGroupNames = await fetchGroupNames();
    if (!initialProducts || initialProducts.length === 0) {
      console.log("商品データの取得に失敗しました");
    }
    if (!initialCategories || initialCategories.length === 0) {
      console.log("カテゴリデータの取得に失敗しました");
    }
    if (!initialGroupNames || initialGroupNames.length === 0) {
      console.log("グループ名データの取得に失敗しました");
    }
  } catch (e) {
    console.error("初期データの取得中にエラーが発生しました:", e);
    error =
      e instanceof Error
        ? e.message
        : "データの取得中に予期せぬエラーが発生しました";
  }

  if (error) {
    return (
      <main className="mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto p-4">
      <ProductPriceRecord
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        initialGroupNames={initialGroupNames}
      />
    </main>
  );
}
