import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Modal } from "../ui";
import { MediaPicker } from "./Media";

/**
 * Визуальный редактор текста: заголовки, абзацы, списки, ссылки, цитаты, изображения из медиатеки.
 * Результат — HTML, который сервер дополнительно очищает по белому списку тегов.
 */
export function RichTextEditor({ value, onChange, label, minHeight }: { value: string; onChange: (html: string) => void; label: string; minHeight?: number }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["mailto", "tel"], HTMLAttributes: { rel: null, target: null } }),
      Image.configure({ inline: false }),
    ],
    content: value || "",
    editorProps: { attributes: { "aria-label": label, role: "textbox", "aria-multiline": "true", ...(minHeight ? { style: `min-height:${minHeight}px` } : {}) } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  // внешнее обновление значения (например, после загрузки записи)
  useEffect(() => {
    if (editor && !editor.isFocused && value !== (editor.isEmpty ? "" : editor.getHTML())) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return <div className="a-editor" style={{ minHeight: 200 }} />;

  return (
    <div className="a-editor">
      <Toolbar editor={editor} onLink={() => setLinkOpen(true)} onImage={() => setImageOpen(true)} />
      <div className="a-editor-content">
        <EditorContent editor={editor} />
      </div>
      {linkOpen && <LinkDialog editor={editor} onClose={() => setLinkOpen(false)} />}
      {imageOpen && (
        <MediaPicker
          title="Изображение в тексте"
          onClose={() => setImageOpen(false)}
          onSelect={(m) => {
            editor.chain().focus().setImage({ src: m.url, alt: m.alt }).run();
            setImageOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Toolbar({ editor, onLink, onImage }: { editor: Editor; onLink: () => void; onImage: () => void }) {
  // перерисовка панели при изменении выделения
  const [, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    editor.on("transaction", h);
    return () => {
      editor.off("transaction", h);
    };
  }, [editor]);

  const btn = (label: string, title: string, active: boolean, run: () => void, disabled = false) => (
    <button type="button" className={active ? "on" : ""} title={title} aria-label={title} aria-pressed={active} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={run}>
      {label}
    </button>
  );
  const c = () => editor.chain().focus();
  return (
    <div className="a-editor-toolbar" role="toolbar" aria-label="Форматирование">
      {btn("¶", "Обычный абзац", editor.isActive("paragraph"), () => c().setParagraph().run())}
      {btn("H2", "Заголовок раздела", editor.isActive("heading", { level: 2 }), () => c().toggleHeading({ level: 2 }).run())}
      {btn("H3", "Подзаголовок", editor.isActive("heading", { level: 3 }), () => c().toggleHeading({ level: 3 }).run())}
      <span className="sep" />
      {btn("Ж", "Полужирный", editor.isActive("bold"), () => c().toggleBold().run())}
      {btn("К", "Курсив", editor.isActive("italic"), () => c().toggleItalic().run())}
      {btn("S̶", "Зачёркнутый", editor.isActive("strike"), () => c().toggleStrike().run())}
      <span className="sep" />
      {btn("•", "Маркированный список", editor.isActive("bulletList"), () => c().toggleBulletList().run())}
      {btn("1.", "Нумерованный список", editor.isActive("orderedList"), () => c().toggleOrderedList().run())}
      {btn("❝", "Цитата", editor.isActive("blockquote"), () => c().toggleBlockquote().run())}
      {btn("—", "Разделитель", false, () => c().setHorizontalRule().run())}
      <span className="sep" />
      {btn("🔗", "Ссылка", editor.isActive("link"), onLink)}
      {btn("🖼", "Изображение из медиатеки", false, onImage)}
      <span className="sep" />
      {btn("↶", "Отменить", false, () => c().undo().run(), !editor.can().undo())}
      {btn("↷", "Повторить", false, () => c().redo().run(), !editor.can().redo())}
    </div>
  );
}

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

function LinkDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [href, setHref] = useState<string>(editor.getAttributes("link").href ?? "");
  const [error, setError] = useState("");
  const apply = () => {
    const v = href.trim();
    if (!v) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return onClose();
    }
    if (!SAFE_HREF.test(v)) return setError("Ссылка должна начинаться с https://, /, mailto: или tel:");
    const { empty } = editor.state.selection;
    if (empty && !editor.isActive("link")) {
      editor.chain().focus().insertContent({ type: "text", text: v, marks: [{ type: "link", attrs: { href: v } }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: v }).run();
    }
    onClose();
  };
  return (
    <Modal
      title="Ссылка"
      onClose={onClose}
      footer={
        <>
          {editor.isActive("link") && (
            <button
              type="button"
              className="a-btn a-btn-danger"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                onClose();
              }}
            >
              Убрать ссылку
            </button>
          )}
          <button type="button" className="a-btn" onClick={onClose}>
            Отмена
          </button>
          <button type="button" className="a-btn a-btn-primary" onClick={apply}>
            Применить
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <label className="a-label" htmlFor="link-href">
          Адрес ссылки
        </label>
        <input id="link-href" className="a-input" value={href} onChange={(e) => (setHref(e.target.value), setError(""))} placeholder="https://example.ru или /about/" aria-invalid={error ? "true" : undefined} />
        {error ? <div className="a-error-text">{error}</div> : <div className="a-hint">Внешние ссылки откроются в новой вкладке. Выделите текст перед добавлением ссылки.</div>}
      </form>
    </Modal>
  );
}
