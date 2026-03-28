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
            {dates.map((date) => {
                const cover = entryMeta[date]?.cover ?? null;
                const active = pathname === `/${date}`;
                return (
                    <a
                        key={date}
                        href={`/${date}`}
                        onClick={(e) => handleClick(e, date)}
                        className={`${styles.cell} ${active ? styles.active : ""}`}
                    >
                        {cover
                            ? <img src={cover} alt={date} className={styles.image} />
                            : <div className={styles.empty} />
                        }
                    </a>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
