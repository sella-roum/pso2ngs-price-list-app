import "server-only";
import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export default function DocumentPage() {
  // マークダウンファイルを読み込む
  const documentPath = path.join(process.cwd(), "app", "document.md");
  const documentContent = fs.readFileSync(documentPath, "utf8");

  return (
    <div className="justify-center py-8 px-4">
      <div className="prose prose-sm mx-auto sm:prose lg:prose-lg xl:prose-xl">
        <ReactMarkdown>{documentContent}</ReactMarkdown>
      </div>
    </div>
  );
}
