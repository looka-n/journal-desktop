"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import ImageStrip from "../components/ImageStrip";

export default function EntryEditor({ date }: { date: string }) {
    const [saved, setSaved] = useState({ title: "", content: "", images: [] as string[] });
    const [draft, setDraft] = useState({ title: "", content: "", images: [] as string[] });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        async function loadEntry() {
            const res = await fetch(`/api/entries/${date}`);
            const data = await res.json();
            const entry = { title: data.title, content: data.content, images: data.images };
            setSaved(entry);
            setDraft(entry);
            setLoading(false);
        }
        loadEntry();
    }, [date]);

    function handleEdit() {
        setDraft(saved);
        setIsEditing(true);
    }

    function handleCancel() {
        setDraft(saved);
        setIsEditing(false);
    }

    async function handleUpload(files: FileList) {
        setUploading(true);
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("images", file));

        const res = await fetch(`/api/entries/${date}/images`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        setDraft((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
        setUploading(false);
    }

    async function handleRemove(index: number) {
        const url = draft.images[index];
        await fetch(`/api/entries/${date}/images`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });
        setDraft((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    }

    async function handleSave() {
        setSaving(true);
        try {
            await fetch(`/api/entries/${date}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            });
            setSaved(draft);
            setIsEditing(false);
        } catch (err) {
            console.error("Save error:", err);
        }
        setSaving(false);
    }

    if (loading) {
        return (
            <div className={styles.spinnerWrap}>
                <div className={styles.spinner} />
            </div>
        );
    }

    if (!isEditing) {
        return (
            <div className={styles.entry} key={date}>
                <div className={styles.readHeader}>
                    <h1 className={styles.readTitle}>{saved.title || <span className={styles.empty}>No title</span>}</h1>
                    <button className={styles.editBtn} onClick={handleEdit}>Edit</button>
                </div>
                {saved.images.length > 0 && <ImageStrip images={saved.images} />}
                <p className={styles.readContent}>{saved.content || <span className={styles.empty}>No content yet.</span>}</p>
            </div>
        );
    }

    return (
        <div className={styles.entry} key={`${date}-edit`}>
            <input
                className={styles.title}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Title"
            />
            <ImageStrip
                images={draft.images}
                isEditing
                onUpload={handleUpload}
                onRemove={handleRemove}
            />
            {uploading && <p className={styles.empty}>Uploading...</p>}
            <textarea
                className={styles.editor}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                placeholder="Write your entry..."
            />
            <div className={styles.actions}>
                <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
}
