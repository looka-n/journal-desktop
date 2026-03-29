"use client";

import { useRouter } from "next/navigation";
import { useEntryContext } from "../context/EntryContext";
import styles from "./SidebarCard.module.css";

interface Props {
    date: string;
    title: string;
    cover: string | null;
    active: boolean;
    index: number;
    favorite: boolean;
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr + "T00:00:00");
    return {
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        number: date.getDate().toString(),
        year: date.getFullYear().toString(),
    };
}

export default function SidebarCard({ date, title, cover, active, index, favorite }: Props) {
    const { day, month, number, year } = formatDate(date);
    const { isEditing, setIsEditing, showModal } = useEntryContext();
    const router = useRouter();

    function handleClick(e: React.MouseEvent) {
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
        <a
            href={`/${date}`}
            onClick={handleClick}
            className={`${styles.card} ${active ? styles.active : ""}`}
            style={{ animationDelay: `${index * 40}ms` }}
        >
            <div className={styles.image}>
                {cover
                    ? <img src={cover} alt="cover" />
                    : <div className={styles.placeholder} />
                }
            </div>
            <div className={styles.text}>
                <div className={styles.left}>
                    <span className={styles.day}>{day}</span>
                    {title && <span className={styles.title}>{title}</span>}
                </div>
                <div className={styles.right}>
                    {favorite && (
                        <svg className={styles.star} width="12" height="12" viewBox="0 0 18 18" fill="currentColor">
                            <path d="M9 1.5L11.09 6.26L16.18 6.77L12.54 10.14L13.64 15.18L9 12.51L4.36 15.18L5.46 10.14L1.82 6.77L6.91 6.26L9 1.5Z" />
                        </svg>
                    )}
                    <div className={styles.dateStack}>
                        <span className={styles.month}>{month}</span>
                        <span className={styles.number}>{number}</span>
                        <span className={styles.year}>{year}</span>
                    </div>
                </div>
            </div>
        </a>
    );
}
