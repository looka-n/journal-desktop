"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import styles from "./Editor.module.css";

interface Props {
    content: string;
    onChange: (html: string) => void;
}

export default function Editor({ content, onChange }: Props) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Write your entry...",
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: styles.editor,
            },
        },
    });
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content]);

    return <EditorContent editor={editor} className={styles.wrap} />;
}
