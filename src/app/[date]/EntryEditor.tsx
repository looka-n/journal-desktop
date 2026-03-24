"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function EntryEditor({ date }: { date: string }) {
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadEntry() {
            const res = await fetch(`/api/entries/${date}`);
            const data = await res.json();
            setContent(data.content);
        }
        loadEntry();
    }, [date]);

    async function handleSave() {
        setSaving(true);
        try {
            await fetch(`/api/entries/${date}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
        } catch (err) {
            console.error("Save error:", err);
        }
        setSaving(false);
    }

    return (
        <div className={styles.entry}>
            <h1>{date}</h1>
            <textarea
                className={styles.editor}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Talk about your day..."
            />
            <button className={styles.save} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    );
}
