"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEntryContext } from "../../context/EntryContext";
import styles from "./CalendarView.module.css";

interface EntryMeta {
    title: string;
    cover: string | null;
}

interface Props {
    entryMeta: Record<string, EntryMeta>;
    pathname: string;
}

function getMonths(): { year: number; month: number }[] {
    const months = [];
    const start = new Date();
    start.setDate(1);
    for (let i = 0; i < 24; i++) {
        months.push({ year: start.getFullYear(), month: start.getMonth() });
        start.setMonth(start.getMonth() - 1);
    }
    return months;
}

function getDaysInMonth(year: number, month: number): (string | null)[] {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (string | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        days.push(dateStr);
    }
    return days;
}

const TODAY = new Date().toISOString().split("T")[0];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarView({ entryMeta, pathname }: Props) {
    const months = getMonths();
    const { isEditing, setIsEditing, showModal } = useEntryContext();
    const router = useRouter();
    const todayRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        todayRef.current?.scrollIntoView({ block: "center" });
    }, []);

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
        <div className={styles.calendar}>
            {months.map(({ year, month }) => (
                <div key={`${year}-${month}`} className={styles.month}>
                    <div className={styles.monthHeader}>
                        {MONTH_NAMES[month]} {year}
                    </div>
                    <div className={styles.dayNames}>
                        {DAY_NAMES.map((d) => (
                            <span key={d} className={styles.dayName}>{d}</span>
                        ))}
                    </div>
                    <div className={styles.grid}>
                        {getDaysInMonth(year, month).map((date, i) => {
                            if (!date) return <div key={i} className={styles.empty} />;
                            const cover = entryMeta[date]?.cover ?? null;
                            const active = pathname === `/${date}`;
                            const isToday = date === TODAY;
                            return (
                                <a
                                    key={date}
                                    ref={isToday ? todayRef : null}
                                    href={`/${date}`}
                                    onClick={(e) => handleClick(e, date)}
                                    className={`${styles.day} ${active ? styles.active : ""} ${isToday ? styles.today : ""}`}
                                >
                                    {cover
                                        ? <img src={cover} alt={date} className={styles.cover} />
                                        : <span className={styles.dayNumber}>{new Date(date + "T00:00:00").getDate()}</span>
                                    }
                                </a>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
