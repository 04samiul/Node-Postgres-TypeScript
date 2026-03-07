import { useRef, useCallback } from "react";
import { Bold, Underline, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "ul", "ol", "li", "p", "br", "div", "span"],
  ALLOWED_ATTR: [],
};

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className, minHeight = "100px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(sanitize(editorRef.current.innerHTML));
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(sanitize(editorRef.current.innerHTML));
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const toolbarButtons = [
    { command: "bold", icon: Bold, label: "Bold" },
    { command: "italic", icon: Italic, label: "Italic" },
    { command: "underline", icon: Underline, label: "Underline" },
    { command: "insertUnorderedList", icon: List, label: "Bullet List" },
    { command: "insertOrderedList", icon: ListOrdered, label: "Numbered List" },
  ];

  return (
    <div className={cn("border rounded-md overflow-hidden bg-background", className)} data-testid="rich-text-editor">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b bg-muted/30">
        {toolbarButtons.map(({ command, icon: Icon, label }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => execCommand(command)}
            title={label}
            data-testid={`button-format-${command}`}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="px-3 py-2 text-sm outline-none overflow-auto prose prose-sm max-w-none dark:prose-invert [&>*]:my-0"
        style={{ minHeight }}
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: sanitize(value || "") }}
        data-placeholder={placeholder}
        data-testid="input-rich-text"
      />
    </div>
  );
}

export function RichTextDisplay({ content, className }: { content: string; className?: string }) {
  if (!content) return null;

  const isPlainText = !/<[a-z][\s\S]*>/i.test(content);

  if (isPlainText) {
    return <span className={className} style={{ whiteSpace: "pre-wrap" }}>{content}</span>;
  }

  return (
    <span
      className={cn("prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
      dangerouslySetInnerHTML={{ __html: sanitize(content) }}
    />
  );
}
