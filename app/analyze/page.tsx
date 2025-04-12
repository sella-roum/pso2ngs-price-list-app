import { Suspense } from "react";
import { AnalysisForm } from "./components/analysis-form";
import { AnalysisResultSkeleton } from "./components/analysis-result-skeleton";
import { AnalysisResult } from "./components/analysis-result";
import { Skeleton } from "@/components/ui/skeleton"; // スケルトンをインポートする場合

export default function AnalyzePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">価格分析</h1>

      <div className="grid gap-6">
        {/* AnalysisForm を Suspense でラップ */}
        <Suspense
          fallback={
            // フォーム用のシンプルなスケルトンまたは null
            <div className="bg-card rounded-lg shadow p-6 space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          }
        >
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">分析条件</h2>
            <AnalysisForm />
          </div>
        </Suspense>

        {/* AnalysisResult は既に Suspense でラップされている */}
        <Suspense fallback={<AnalysisResultSkeleton />}>
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">分析結果</h2>
            <AnalysisResult />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
