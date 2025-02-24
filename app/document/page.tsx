import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export default function DocumentPage() {
  // マークダウンファイルを読み込む
  const documentPath = path.join(process.cwd(), "app", "document.md");
  const documentContent = fs.readFileSync(documentPath, "utf8");

  return (
    <div className="mx-auto py-8 px-4">
      <div className="container prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
        <ReactMarkdown>{documentContent}</ReactMarkdown>
      </div>
    </div>
  );
}
