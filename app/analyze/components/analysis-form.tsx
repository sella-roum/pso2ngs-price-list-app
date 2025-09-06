"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { analysisParamsSchema } from "@/lib/validations/product";
import { fetchCategories } from "@/app/actions";

type FormValues = z.infer<typeof analysisParamsSchema>;

export function AnalysisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // フォームの初期値を検索パラメータから取得
  const defaultValues: Partial<FormValues> = {
    targetType: (searchParams.get("targetType") as "product" | "category") || "product",
    targetName: searchParams.get("targetName") || "",
    period: (searchParams.get("period") as "7d" | "30d" | "all") || "7d",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(analysisParamsSchema),
    defaultValues,
  });

  // カテゴリリストの取得
  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      toast({
        title: "エラー",
        description: "カテゴリの取得に失敗しました",
        variant: "destructive",
      });
    }
  };

  // 初期値がcategoryなら初回にカテゴリ取得
  useEffect(() => {
    if (form.getValues("targetType") === "category" && categories.length === 0) {
      void loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, categories.length]);

  // targetTypeが変更されたときにカテゴリリストを取得
  const onTargetTypeChange = (value: "product" | "category") => {
    if (value === "category" && categories.length === 0) {
      void loadCategories();
    }
  };

  // フォーム送信時の処理
  const onSubmit = (data: FormValues) => {
    setIsLoading(true);

    try {
      // URLパラメータを更新
      const params = new URLSearchParams();
      params.set("targetType", data.targetType);
      params.set("targetName", data.targetName);
      params.set("period", data.period);

      router.push(`/analyze?${params.toString()}`);

      toast({
        title: "分析開始",
        description: "データを分析しています...",
      });
    } catch {
      toast({
        title: "エラー",
        description: "分析の開始に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="targetType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>分析対象</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    onTargetTypeChange(value as "product" | "category");
                  }}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="product" />
                    </FormControl>
                    <FormLabel className="font-normal">商品名</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="category" />
                    </FormControl>
                    <FormLabel className="font-normal">カテゴリ</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{form.watch("targetType") === "product" ? "商品名" : "カテゴリ名"}</FormLabel>
              <FormControl>
                {form.watch("targetType") === "product" ? (
                  <Input placeholder="商品名を入力" {...field} />
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormControl>
              <FormDescription>
                {form.watch("targetType") === "product"
                  ? "分析したい商品の名前を入力してください"
                  : "分析したいカテゴリを選択してください"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>期間</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="期間を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="7d">過去7日間</SelectItem>
                  <SelectItem value="30d">過去30日間</SelectItem>
                  <SelectItem value="all">全期間</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>分析する期間を選択してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "分析中..." : "分析実行"}
        </Button>
      </form>
    </Form>
  );
}
