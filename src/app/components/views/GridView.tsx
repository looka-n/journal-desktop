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

function getMonthLabel(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        month: "long", year: "numeric"
    });
}

function groupByMonth(dates: string[]): { month: string; dates: string[] }[] {
    const groups: { month: string; dates: string[] }[] = [];
    let current: { month: string; dates: string[] } | null = null;

    for (const date of dates) {
        const month = getMonthLabel(date);
        if (!current || current.month !== month) {
            current = { month, dates: [] };
            groups.push(current);
        }
        current.dates.push(date);
    }

    return groups;
}

export default function GridView({ dates, entryMeta, pathname, bottomRef }: Props) {
    const { isEditing, setIsEditing, showModal } = useEntryContext();
    const router = useRouter();
    const groups = groupByMonth(dates);

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

    let globalIndex = 0;

    return (
        <div>
            {groups.map(({ month, dates: groupDates }) => (
                <div key={month} className={styles.group}>
                    <div className={styles.monthHeader}>{month}</div>
                    <div className={styles.grid}>
                        {groupDates.map((date) => {
                            const cover = entryMeta[date]?.cover ?? null;
                            const active = pathname === `/${date}`;
                            const index = globalIndex++;
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
                                </a>
                            );
                        })}
                    </div>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
