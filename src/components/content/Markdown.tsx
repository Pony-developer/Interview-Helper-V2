import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { highlight } from "@/lib/highlight";

async function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const html = await highlight(code, lang);
  return <div className="code-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Renders trusted, authored Markdown (lectures, task prompts) with highlighted code blocks. */
export function Markdown({ children, className = "prose-assay" }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children: preChildren }) => <>{preChildren}</>,
          code: ({ className: codeClass, children: codeChildren }) => {
            const match = /language-(\w+)/.exec(codeClass ?? "");
            const text = String(codeChildren ?? "");
            if (!match && !text.includes("\n")) return <code>{codeChildren}</code>;
            return <CodeBlock code={text} lang={match?.[1] ?? "text"} />;
          },
          table: ({ children: tableChildren }) => (
            <div className="overflow-x-auto">
              <table>{tableChildren}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
