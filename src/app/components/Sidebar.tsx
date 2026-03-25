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

function generateFilteredDates(query: string): string[] {
    const results: string[] = [];
    const cursor = new Date();
    // search back 10 years
    for (let i = 0; i < 365 * 10; i++) {
        const dateStr = cursor.toISOString().split("T")[0];
        const friendly = cursor.toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric"
        }).toLowerCase();
        if (dateStr.includes(query) || friendly.includes(query.toLowerCase())) {
            results.push(dateStr);
        }
        cursor.setDate(cursor.getDate() - 1);
    }
    return results;
}

interface EntryMeta {
    title: string;
    cover: string | null;
}

export default function Sidebar() {
    const [dates, setDates] = useState<string[]>(() => generateDates(new Date(), BATCH_SIZE));
    const [entryMeta, setEntryMeta] = useState<Record<string, EntryMeta>>({});
    const [query, setQuery] = useState("");
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
        if (query) return;
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
    }, [query]);

    const filteredDates = query
        ? generateFilteredDates(query).filter((date) => {
            const title = entryMeta[date]?.title?.toLowerCase() ?? "";
            return title.includes(query.toLowerCase()) ||
                date.includes(query) ||
                new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric", year: "numeric"
                }).toLowerCase().includes(query.toLowerCase());
        })
        : dates;

    return (
        <aside className={styles.sidebar}>
            <div className={styles.searchWrap}>
                <input
                    className={styles.search}
                    type="text"
                    placeholder="Search entries..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button className={styles.clear} onClick={() => setQuery("")}>×</button>
                )}
            </div>
            {filteredDates.map((date) => (
                <SidebarCard
                    key={date}
                    date={date}
                    title={entryMeta[date]?.title ?? ""}
                    cover={entryMeta[date]?.cover ?? null}
                    active={pathname === `/${date}`}
                />
            ))}
            {!query && <div ref={bottomRef} />}
        </aside>
    );
}
