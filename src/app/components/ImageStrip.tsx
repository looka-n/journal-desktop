import styles from "./ImageStrip.module.css";
import { MediaItem } from "@/lib/media";

interface Props {
    items: MediaItem[];
    isEditing?: boolean;
    onUpload?: (files: FileList) => void;
    onRemove?: (index: number) => void;
    onAddEmbed?: (url: string) => void;
}

export default function ImageStrip({ items, isEditing, onUpload, onRemove, onAddEmbed }: Props) {
    function handleAddEmbed() {
        const url = window.prompt("Paste a URL (YouTube, Medal, Twitter, TikTok):");
        if (url?.trim()) onAddEmbed?.(url.trim());
    }

    return (
        <div className={styles.strip}>
            {items.map((item, i) => (
                <div key={i} className={styles.thumb}>
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
