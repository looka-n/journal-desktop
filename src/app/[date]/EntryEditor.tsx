"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Carousel from "../components/Carousel";
import ImageStrip from "../components/ImageStrip";
import { useEntryContext } from "../context/EntryContext";
import { MediaItem, normalizeMedia, detectPlatform } from "@/lib/media";

export default function EntryEditor({ date }: { date: string }) {
    const [saved, setSaved] = useState({ title: "", content: "", media: [] as MediaItem[] });
    const [draft, setDraft] = useState({ title: "", content: "", media: [] as MediaItem[] });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const { refreshSidebar, isEditing, setIsEditing, showToast } = useEntryContext();

    useEffect(() => {
        setLoading(true);
        setIsEditing(false);
        async function loadEntry() {
            const res = await fetch(`/api/entries/${date}`);
            const data = await res.json();
            const media = normalizeMedia(data.images ?? []);
            const entry = { title: data.title, content: data.content, media };
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
        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => formData.append("images", file));
            const res = await fetch(`/api/entries/${date}/images`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            const newItems: MediaItem[] = data.urls.map((url: string) => ({ type: "image" as const, url }));
            setDraft((prev) => ({ ...prev, media: [...prev.media, ...newItems] }));
        } catch (err) {
            console.error("Upload error:", err);
            showToast("Failed to upload image", "error");
        }
        setUploading(false);
    }

    function handleAddEmbed(url: string) {
        const platform = detectPlatform(url);
        const item: MediaItem = { type: "embed", platform, url };
        setDraft((prev) => ({ ...prev, media: [...prev.media, item] }));
    }

    async function handleRemove(index: number) {
        const item = draft.media[index];
        try {
            if (item.type === "image") {
                await fetch(`/api/entries/${date}/images`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: item.url }),
                });
            }
            setDraft((prev) => ({
                ...prev,
                media: prev.media.filter((_, i) => i !== index),
            }));
        } catch (err) {
            console.error("Delete error:", err);
            showToast("Failed to remove image", "error");
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await fetch(`/api/entries/${date}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: draft.title, content: draft.content, images: draft.media }),
            });
            setSaved(draft);
            setIsEditing(false);
            refreshSidebar();
            showToast("Entry saved", "success");
        } catch (err) {
            console.error("Save error:", err);
            showToast("Failed to save entry", "error");
        }
        setSaving(false);
    }

    function handleReorder(reordered: MediaItem[]) {
        setDraft((prev) => ({ ...prev, media: reordered }));
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
                    <div className={styles.titleBlock}>
                        <h1 className={styles.readTitle}>{saved.title || <span className={styles.empty}>No title</span>}</h1>
                        <span className={styles.dateSubtitle}>
                            {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "long", month: "long", day: "numeric", year: "numeric"
                            })}
                        </span>
                    </div>
                    <button className={styles.editBtn} onClick={handleEdit}>Edit</button>
                </div>
                {saved.media.length > 0 ? (
                    <div className={styles.twoCol}>
                        <div className={styles.colCarousel}>
                            <Carousel items={saved.media} />
                        </div>
                        <div className={styles.colContent}>
                            <p className={styles.readContent}>{saved.content || <span className={styles.empty}>No content yet.</span>}</p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.inset}>
                        <p className={styles.readContent}>{saved.content || <span className={styles.empty}>No content yet.</span>}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={styles.entry} key={`${date}-edit`}>
            <div className={styles.editHeader}>
                <div className={styles.titleBlock}>
                    <input
                        className={styles.title}
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        placeholder="Title"
                    />
                    <span className={styles.dateSubtitle}>
                        {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric", year: "numeric"
                        })}
                    </span>
                </div>
            </div>
            <ImageStrip
                items={draft.media}
                isEditing
                onUpload={handleUpload}
                onRemove={handleRemove}
                onAddEmbed={handleAddEmbed}
                onReorder={handleReorder}
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
