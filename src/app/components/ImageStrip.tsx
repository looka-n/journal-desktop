"use client";

import { useState } from "react";
import styles from "./ImageStrip.module.css";
import { MediaItem } from "@/lib/media";

interface Props {
    items: MediaItem[];
    isEditing?: boolean;
    onUpload?: (files: FileList) => void;
    onRemove?: (index: number) => void;
    onAddEmbed?: (url: string) => void;
    onReorder?: (items: MediaItem[]) => void;
}

export default function ImageStrip({ items, isEditing, onUpload, onRemove, onAddEmbed, onReorder }: Props) {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    function handleDragStart(index: number) {
        setDragIndex(index);
    }

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(index);
    }

    function handleDrop(e: React.DragEvent, index: number) {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) {
            setDragOver(null);
            return;
        }
        const reordered = [...items];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(index, 0, moved);
        onReorder?.(reordered);
        setDragIndex(null);
        setDragOver(null);
    }

    function handleDragEnd() {
        setDragIndex(null);
        setDragOver(null);
    }

    function handleAddEmbed() {
        const url = window.prompt("Paste a URL (YouTube, Medal, Twitter, TikTok):");
        if (url?.trim()) onAddEmbed?.(url.trim());
    }

    return (
        <div className={styles.strip}>
            {items.map((item, i) => (
                <div
                    key={i}
                    className={`${styles.thumb} ${dragOver === i ? styles.dragOver : ""} ${dragIndex === i ? styles.dragging : ""}`}
                    draggable={isEditing}
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                >
                    {item.type === "image"
                        ? <img src={item.url} alt={`media ${i + 1}`} />
                        : <div className={styles.embedThumb}>🎬</div>
                    }
                    {isEditing && (
                        <button className={styles.remove} onClick={() => onRemove?.(i)}>×</button>
                    )}
                </div>
            ))}
            {isEditing && (
                <>
                    <label className={styles.upload}>
                        +
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) => e.target.files && onUpload?.(e.target.files)}
                        />
                    </label>
                    <button className={styles.addLink} onClick={handleAddEmbed}>🔗</button>
                </>
            )}
        </div>
    );
}
