"use client"; // Error Boundary は Client Component である必要があります

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorProps {
  error: Error & { digest?: string }; // エラーオブジェクト
  reset: () => void; // セグメントを再レンダリングする関数
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーをログサービスに記録するなど
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-10 px-4">
      <Alert variant="destructive">
        <AlertTitle>エラーが発生しました</AlertTitle>
        <AlertDescription>
          データの読み込み中に問題が発生しました。
          <p className="mt-2 font-mono text-sm bg-muted p-2 rounded">{error.message || "不明なエラーです。"}</p>
        </AlertDescription>
      </Alert>
      <div className="mt-6 text-center">
        <Button
          onClick={
            // reset() 関数を呼び出して、データ取得を再試行
            () => reset()
          }
        >
          再試行
        </Button>
      </div>
    </div>
  );
}
