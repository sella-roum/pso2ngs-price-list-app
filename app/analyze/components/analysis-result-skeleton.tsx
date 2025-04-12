import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AnalysisResultSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">分析結果</h2>

      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">グラフ</TabsTrigger>
          <TabsTrigger value="table">表</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
