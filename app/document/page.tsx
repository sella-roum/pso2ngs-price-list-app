import "server-only";
import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-static";

export default function DocumentPage() {
  // マークダウンファイルを読み込む
  const documentPath = path.join(process.cwd(), "app", "document.md");
  let documentContent = "";
  try {
    documentContent = fs.readFileSync(documentPath, "utf8");
  } catch (error) {
    console.error("ドキュメントファイルの読み込みに失敗しました:", error);
    documentContent = "ドキュメントを読み込めませんでした。";
  }

  return (
    <div className="justify-center py-8 px-4">
      <div className="prose prose-sm mx-auto sm:prose lg:prose-lg xl:prose-xl">
        <ReactMarkdown>{documentContent}</ReactMarkdown>
      </div>
    </div>
  );
}
