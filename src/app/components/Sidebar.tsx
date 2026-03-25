"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const BATCH_SIZE = 60;

function generateDates(from: Date, count: number): string[] {
    const dates: string[] = [];
    const cursor = new Date(from);
    for (let i = 0; i < count; i++) {
        dates.push(cursor.toISOString().split("T")[0]);
        cursor.setDate(cursor.getDate() - 1);
    }
    return dates;
}

export default function Sidebar() {
    const [dates, setDates] = useState<string[]>(() => generateDates(new Date(), BATCH_SIZE));
    const [savedDates, setSavedDates] = useState<Set<string>>(new Set());
    const bottomRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        async function loadSavedDates() {
            const res = await fetch("/api/entries");
            const data = await res.json();
            setSavedDates(new Set(data.dates));
        }
        loadSavedDates();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setDates((prev) => {
                    const oldest = new Date(prev[prev.length - 1]);
                    oldest.setDate(oldest.getDate() - 1);
                    return [...prev, ...generateDates(oldest, BATCH_SIZE)];
                });
            }
        });

        if (bottomRef.current) observer.observe(bottomRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <aside className={styles.sidebar}>
            <ul className={styles.list}>
                {dates.map((date) => (
                    <li key={date}>
                        <Link
                            href={`/${date}`}
                            className={`${styles.item} ${pathname === `/${date}` ? styles.active : ""}`}
                        >
                            {date}
                            {savedDates.has(date) && <span className={styles.dot} />}
                        </Link>
                    </li>
                ))}
            </ul>
            <div ref={bottomRef} />
        </aside>
    );
}
