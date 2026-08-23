import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link2, Image as ImageIcon, Code2,
  AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, Eraser, Minus, Palette,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

const COLORS = ["#16181c", "#dc3545", "#0f766e", "#1d4ed8", "#b45309", "#6b7280"];

/**
 * Word-processor style WYSIWYG editor built on contentEditable.
 * Emits HTML which is rendered on the public blog.
 */
export default function RichTextEditor({ value, onChange, placeholder, minHeight = 380 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [, force] = useState(0);

  // Load initial/external HTML without clobbering the caret while typing.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value === "" ? "" : undefined]);

  const emit = () => onChange(ref.current?.innerHTML ?? "");

  const cmd = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
    force((n) => n + 1);
  };

  const active = (command: string) => {
    try { return document.queryCommandState(command); } catch { return false; }
  };

  const addLink = () => {
    const url = window.prompt("Enter the URL (include https://)");
    if (url) cmd("createLink", url);
  };

  const addImage = () => {
    const url = window.prompt("Image URL (include https://)");
    if (url) cmd("insertImage", url);
  };

  const counts = () => {
    const text = ref.current?.innerText ?? "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { words, mins: Math.max(1, Math.round(words / 200)) };
  };
  const { words, mins } = counts();

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-cream p-2">
        <Btn on={active("bold")} title="Bold (Ctrl+B)" onClick={() => cmd("bold")}><Bold className="h-4 w-4" /></Btn>
        <Btn on={active("italic")} title="Italic (Ctrl+I)" onClick={() => cmd("italic")}><Italic className="h-4 w-4" /></Btn>
        <Btn on={active("underline")} title="Underline (Ctrl+U)" onClick={() => cmd("underline")}><Underline className="h-4 w-4" /></Btn>
        <Btn on={active("strikeThrough")} title="Strikethrough" onClick={() => cmd("strikeThrough")}><Strikethrough className="h-4 w-4" /></Btn>

        <Sep />
        <Btn title="Heading 1" onClick={() => cmd("formatBlock", "<h1>")}><Heading1 className="h-4 w-4" /></Btn>
        <Btn title="Heading 2" onClick={() => cmd("formatBlock", "<h2>")}><Heading2 className="h-4 w-4" /></Btn>
        <Btn title="Heading 3" onClick={() => cmd("formatBlock", "<h3>")}><Heading3 className="h-4 w-4" /></Btn>
        <Btn title="Normal text" onClick={() => cmd("formatBlock", "<p>")}>
          <span className="px-0.5 text-xs font-bold">P</span>
        </Btn>

        <Sep />
        <Btn on={active("insertUnorderedList")} title="Bullet list" onClick={() => cmd("insertUnorderedList")}><List className="h-4 w-4" /></Btn>
        <Btn on={active("insertOrderedList")} title="Numbered list" onClick={() => cmd("insertOrderedList")}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn title="Quote" onClick={() => cmd("formatBlock", "<blockquote>")}><Quote className="h-4 w-4" /></Btn>
        <Btn title="Code block" onClick={() => cmd("formatBlock", "<pre>")}><Code2 className="h-4 w-4" /></Btn>

        <Sep />
        <Btn title="Align left" onClick={() => cmd("justifyLeft")}><AlignLeft className="h-4 w-4" /></Btn>
        <Btn title="Align centre" onClick={() => cmd("justifyCenter")}><AlignCenter className="h-4 w-4" /></Btn>
        <Btn title="Align right" onClick={() => cmd("justifyRight")}><AlignRight className="h-4 w-4" /></Btn>

        <Sep />
        <Btn title="Insert link" onClick={addLink}><Link2 className="h-4 w-4" /></Btn>
        <Btn title="Insert image" onClick={addImage}><ImageIcon className="h-4 w-4" /></Btn>
        <Btn title="Divider" onClick={() => cmd("insertHorizontalRule")}><Minus className="h-4 w-4" /></Btn>

        {/* Colour */}
        <div className="relative">
          <Btn title="Text colour" onClick={() => setColorOpen((v) => !v)}><Palette className="h-4 w-4" /></Btn>
          {colorOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border border-line bg-white p-2 shadow-lg">
              {COLORS.map((c) => (
                <button key={c} type="button" title={c}
                  onClick={() => { cmd("foreColor", c); setColorOpen(false); }}
                  className="h-6 w-6 rounded-full border border-line transition hover:scale-110"
                  style={{ background: c }} />
              ))}
            </div>
          )}
        </div>

        <Sep />
        <Btn title="Undo" onClick={() => cmd("undo")}><Undo2 className="h-4 w-4" /></Btn>
        <Btn title="Redo" onClick={() => cmd("redo")}><Redo2 className="h-4 w-4" /></Btn>
        <Btn title="Clear formatting" onClick={() => cmd("removeFormat")}><Eraser className="h-4 w-4" /></Btn>
      </div>

      {/* Editable surface */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onKeyUp={() => force((n) => n + 1)}
        onMouseUp={() => force((n) => n + 1)}
        onPaste={(e) => {
          // Paste as plain text so external styles don't leak in.
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
          emit();
        }}
        data-placeholder={placeholder ?? "Start writing your article…"}
        style={{ minHeight }}
        className="rte prose-editor w-full overflow-y-auto px-5 py-4 text-[15px] leading-[1.8] text-ink outline-none"
      />

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-line bg-cream px-4 py-2 text-xs text-muted">
        <span>{words} word{words === 1 ? "" : "s"} · ~{mins} min read</span>
        <span>Rich text · paste is cleaned automatically</span>
      </div>
    </div>
  );
}

function Btn({ children, onClick, title, on }: {
  children: React.ReactNode; onClick: () => void; title: string; on?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
        on ? "bg-brand text-white" : "text-muted hover:bg-white hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-6 w-px bg-line" />;
}
