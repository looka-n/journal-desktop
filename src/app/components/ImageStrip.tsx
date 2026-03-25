import styles from "./ImageStrip.module.css";

interface Props {
    images: string[];
    isEditing?: boolean;
    onUpload?: (files: FileList) => void;
    onRemove?: (index: number) => void;
}

export default function ImageStrip({ images, isEditing, onUpload, onRemove }: Props) {
    return (
        <div className={styles.strip}>
            {images.map((url, i) => (
                <div key={url} className={styles.thumb}>
                    <img src={url} alt={`image ${i + 1}`} />
                    {isEditing && (
                        <button className={styles.remove} onClick={() => onRemove?.(i)}>×</button>
                    )}
                </div>
            ))}
            {isEditing && (
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
            )}
        </div>
    );
}
