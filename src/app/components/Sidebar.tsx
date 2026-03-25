"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarCard from "./SidebarCard";
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

interface EntryMeta {
    title: string;
    cover: string | null;
}

export default function Sidebar() {
    const [dates, setDates] = useState<string[]>(() => generateDates(new Date(), BATCH_SIZE));
    const [entryMeta, setEntryMeta] = useState<Record<string, EntryMeta>>({});
    const bottomRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        async function loadEntryMeta() {
            const res = await fetch("/api/entries");
            const data = await res.json();
            const meta: Record<string, EntryMeta> = {};
            for (const entry of data.entries) {
                meta[entry.date] = { title: entry.title, cover: entry.cover };
            }
            setEntryMeta(meta);
        }
        loadEntryMeta();
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
            {dates.map((date) => (
                <SidebarCard
                    key={date}
                    date={date}
                    title={entryMeta[date]?.title ?? ""}
                    cover={entryMeta[date]?.cover ?? null}
                    active={pathname === `/${date}`}
                />
            ))}
            <div ref={bottomRef} />
        </aside>
    );
}
