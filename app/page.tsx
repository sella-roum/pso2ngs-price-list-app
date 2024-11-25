import { ProductPriceRecord } from "@/components/ProductPriceRecord";
import { fetchMaxLastModifiedRecord } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductRecord } from "@/types/product";

export default async function Home() {
  let initialProducts: ProductRecord[] = [];
  let error = null;

  try {
    initialProducts = await fetchMaxLastModifiedRecord();
    if (!initialProducts || initialProducts.length === 0) {
      throw new Error("データが見つかりませんでした");
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
      <ProductPriceRecord initialProducts={initialProducts} />
    </main>
  );
}
