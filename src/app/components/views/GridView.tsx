"use client";

import { useRouter } from "next/navigation";
import { useEntryContext } from "../../context/EntryContext";
import styles from "./GridView.module.css";

interface EntryMeta {
    title: string;
    cover: string | null;
}

interface Props {
    dates: string[];
    entryMeta: Record<string, EntryMeta>;
    pathname: string;
    bottomRef: React.RefObject<HTMLDivElement>;
}

export default function GridView({ dates, entryMeta, pathname, bottomRef }: Props) {
    const { isEditing, setIsEditing, showModal } = useEntryContext();
    const router = useRouter();

    function handleClick(e: React.MouseEvent, date: string) {
        e.preventDefault();
        if (isEditing) {
            showModal({
                type: "confirm",
                message: "You have unsaved changes. Leave without saving?",
                confirmLabel: "Leave",
                cancelLabel: "Stay",
                onConfirm: () => {
                    setIsEditing(false);
                    router.push(`/${date}`);
                },
            });
            return;
        }
        router.push(`/${date}`);
    }

    return (
        <div className={styles.grid}>
            {dates.map((date, index) => {
                const cover = entryMeta[date]?.cover ?? null;
                const active = pathname === `/${date}`;
                return (
                    <a
                        key={date}
                        href={`/${date}`}
                        onClick={(e) => handleClick(e, date)}
                        className={`${styles.cell} ${active ? styles.active : ""}`}
                        style={{ animationDelay: `${index * 30}ms` }}
                    >
                        {cover
                            ? <img src={cover} alt={date} className={styles.image} />
                            : <div className={styles.empty} />
                        }
                        {entryMeta[date]?.favorite && (
                            <svg className={styles.star} width="10" height="10" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M9 1.5L11.09 6.26L16.18 6.77L12.54 10.14L13.64 15.18L9 12.51L4.36 15.18L5.46 10.14L1.82 6.77L6.91 6.26L9 1.5Z" />
                            </svg>
                        )}
                    </a>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
