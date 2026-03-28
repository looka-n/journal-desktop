"use client";

import { useEntryContext } from "../context/EntryContext";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ListView from "./views/ListView";
import GridView from "./views/GridView";
import CalendarView from "./views/CalendarView";
import styles from "./Sidebar.module.css";

const BATCH_SIZE = 60;
type View = "list" | "grid" | "calendar";

function ListIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="2" width="13" height="2" rx="1" fill="currentColor" />
            <rect x="1" y="6.5" width="13" height="2" rx="1" fill="currentColor" />
            <rect x="1" y="11" width="13" height="2" rx="1" fill="currentColor" />
        </svg>
    );
}

function GridIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
            <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
            <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
            <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="2" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="1" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5" y1="1" x2="5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="3" y="8.5" width="2" height="2" rx="0.5" fill="currentColor" />
            <rect x="6.5" y="8.5" width="2" height="2" rx="0.5" fill="currentColor" />
            <rect x="10" y="8.5" width="2" height="2" rx="0.5" fill="currentColor" />
        </svg>
    );
}

const VIEW_OPTIONS: { value: View; label: string; icon: React.ReactNode }[] = [
    { value: "list", label: "List", icon: <ListIcon /> },
    { value: "grid", label: "Grid", icon: <GridIcon /> },
    { value: "calendar", label: "Calendar", icon: <CalendarIcon /> },
];

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
    const [view, setView] = useState<View>("list");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { refreshTrigger } = useEntryContext();

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
    }, [refreshTrigger]);

    useEffect(() => {
        if (query || view !== "list") return;
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
    }, [query, view]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const activeView = VIEW_OPTIONS.find((v) => v.value === view)!;

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

            <div className={styles.viewWrap} ref={dropdownRef}>
                <button
                    className={styles.viewTrigger}
                    onClick={() => setDropdownOpen((o) => !o)}
                >
                    <span className={styles.viewIcon}>{activeView.icon}</span>
                    <span>{activeView.label}</span>
                    <svg className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                {dropdownOpen && (
                    <div className={styles.dropdown}>
                        {VIEW_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                className={`${styles.dropdownItem} ${view === option.value ? styles.dropdownItemActive : ""}`}
                                onClick={() => { setView(option.value); setDropdownOpen(false); }}
                            >
                                <span className={styles.viewIcon}>{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {view === "list" && (
                <ListView
                    dates={filteredDates}
                    entryMeta={entryMeta}
                    pathname={pathname}
                    bottomRef={bottomRef}
                />
            )}
            {view === "grid" && (
                <GridView
                    dates={filteredDates}
                    entryMeta={entryMeta}
                    pathname={pathname}
                    bottomRef={bottomRef}
                />
            )}
            {view === "calendar" && (
                <CalendarView
                    entryMeta={entryMeta}
                    pathname={pathname}
                />
            )}
        </aside>
    );
}
