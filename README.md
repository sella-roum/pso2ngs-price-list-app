# PSO2NGS 価格一覧アプリ

## 概要

このアプリケーションは、オンラインゲーム「ファンタシースターオンライン2 ニュージェネシス（PSO2NGS）」のゲーム内アイテム価格情報を集約し、ユーザーに提供するためのWebアプリケーションです。最新の価格情報を一覧・検索できるだけでなく、アイテム同士の比較や価格トレンドの分析といった高度な機能を提供します。

---

## ✨ 主要機能

-   **📊 商品価格一覧**:
    -   全シップのアイテム価格を一覧で表示。
    -   **表示モード切替**: 「テーブル」「カード」「コンパクト」の3つの形式で表示を切り替え可能。
-   **🔍 高度な検索 & フィルタリング**:
    -   カテゴリ、グループ名、商品名（部分一致）による柔軟な検索。
    -   アクティブなフィルターを一覧表示し、個別に解除可能。
-   **🔃 ソート機能**:
    -   価格、更新日、カテゴリ名など、各列をクリックして昇順・降順にソート。
-   **📄 ページネーション**:
    -   表示件数の変更（10, 20, 50件）。
    -   ページ番号によるスムーズな移動。
-   **📈 商品詳細 & 価格履歴**:
    -   商品名クリックで詳細ダイアログを表示。
    -   Rechartsを利用した時系列の価格変動グラフ。
    -   シップごとの価格推移をグラフと表で確認。
-   **⚖️ 商品比較**:
    -   一覧から2つのアイテムを選択し、詳細なスペックと価格履歴を並べて比較。
-   **🔬 価格分析**:
    -   商品名またはカテゴリ単位で、指定期間（過去7日/30日/全期間）の価格トレンドを分析。
    -   日毎の最高/最低/平均価格の推移と変動率をグラフと表で可視化。
-   **📑 サマリー表示**:
    -   表示中アイテムの統計情報（合計数、平均価格、カテゴリ分布など）をグラフで表示。
-   **📥 CSVダウンロード**:
    -   現在表示・フィルタリングされているデータをCSV形式でダウンロード。

---

## 🛠️ 技術スタック

-   **フレームワーク**: [Next.js](https://nextjs.org/) (App Router)
-   **言語**: [TypeScript](https://www.typescriptlang.org/)
-   **バックエンド & DB**: [Supabase](https://supabase.io/)
-   **UIコンポーネント**: [shadcn/ui](https://ui.shadcn.com/)
-   **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
-   **フォーム管理**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **データ可視化**: [Recharts](https://recharts.org/)
-   **アニメーション**: [Framer Motion](https://www.framer.com/motion/)
-   **状態管理**: React Context, URL Search Params

---

## 🚀 セットアップと起動方法

### 1. 前提条件

-   [Node.js](https://nodejs.org/) (v18.17.0 or later)
-   [pnpm](https://pnpm.io/) (または npm/yarn)

### 2. リポジトリのクローン

```bash
git clone https://github.com/sella-roum/pso2ngs-price-list-app.git
cd pso2ngs-price-list-app
```

### 3. 依存関係のインストール

```bash
pnpm install
```

### 4. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、Supabaseプロジェクトの情報を設定します。

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
# Supabase Anon Key (Public)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# Supabase Service Role Key (Secret - for Server Actions)
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` を開くと、アプリケーションが表示されます。

---

## 📁 プロジェクト構造

主要なディレクトリとファイルの役割は以下の通りです。

```
pso2ngs-price-list-app/
├── app/
│   ├── (pages)/              # 各ページ (商品一覧, 分析, 比較など)
│   ├── actions.ts            # データ取得などのサーバーアクション
│   └── layout.tsx            # ルートレイアウト
├── components/
│   ├── ui/                   # shadcn/uiによる基本UIコンポーネント
│   ├── ProductPriceRecord.tsx  # メインの価格一覧表示・操作コンポーネント
│   ├── ProductDialog.tsx     # 商品詳細・価格履歴ダイアログ
│   └── ...                   # その他アプリケーション固有のコンポーネント
├── contexts/
│   └── ComparisonContext.tsx # 商品比較機能の状態管理
├── lib/
│   ├── supabase/             # Supabaseクライアントの設定
│   └── validations/          # Zodによるバリデーションスキーマ
├── types/
│   ├── product.ts            # アプリケーション固有の型定義
│   └── supabase.ts           # Supabaseから自動生成された型定義
└── utils/
    └── formatters.ts         # 通貨や日付のフォーマット関数
```
