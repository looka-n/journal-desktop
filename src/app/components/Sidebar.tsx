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
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="2" width="13" height="2" rx="1" fill="currentColor" />
            <rect x="1" y="6.5" width="13" height="2" rx="1" fill="currentColor" />
            <rect x="1" y="11" width="13" height="2" rx="1" fill="currentColor" />
        </svg>
    );
}

function GridIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
            <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" fill="currentColor" />
            <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
            <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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
    favorite: boolean;
}
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const [dates, setDates] = useState<string[]>(() => generateDates(new Date(), BATCH_SIZE));
    const [entryMeta, setEntryMeta] = useState<Record<string, EntryMeta>>({});
    const [query, setQuery] = useState("");
    const [view, setView] = useState<View>("list");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null!);
    const pathname = usePathname();
    const { refreshTrigger } = useEntryContext();
    const [savedOnly, setSavedOnly] = useState(false);

    useEffect(() => {
        async function loadEntryMeta() {
            const res = await fetch("/api/entries");
            const data = await res.json();
            const meta: Record<string, EntryMeta> = {};
            for (const entry of data.entries) {
                meta[entry.date] = {
                    title: entry.title,
                    cover: entry.cover,
                    favorite: entry.favorite ?? false,
                };
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

    const visibleDates = filteredDates.filter((date) => {
        if (favoritesOnly && !entryMeta[date]?.favorite) return false;
        if (savedOnly && !entryMeta[date]) return false;
        return true;
    });

    const activeView = VIEW_OPTIONS.find((v) => v.value === view)!;

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
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
                <div className={styles.viewControls}>
                    <button
                        className={`${styles.viewTrigger} ${styles.viewTriggerFlex}`}
                        onClick={() => setDropdownOpen((o) => !o)}
                    >
                        <span className={styles.viewIcon}>{activeView.icon}</span>
                        <span>{activeView.label}</span>
                        <svg className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        className={`${styles.savedFilter} ${savedOnly ? styles.savedFilterActive : ""}`}
                        onClick={() => setSavedOnly((s) => !s)}
                        title="Show saved entries only"
                    >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <path
                                d="M3 2C3 1.44772 3.44772 1 4 1H11C11.5523 1 12 1.44772 12 2V13.5C12 13.7761 11.7761 14 11.5 14C11.3684 14 11.2425 13.9473 11.1464 13.8536L7.5 10.2071L3.85355 13.8536C3.75742 13.9497 3.63065 14 3.5 14C3.22386 14 3 13.7761 3 13.5V2Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill={savedOnly ? "currentColor" : "none"}
                            />
                        </svg>
                    </button>
                    <button
                        className={`${styles.favoriteFilter} ${favoritesOnly ? styles.favoriteFilterActive : ""}`}
                        onClick={() => setFavoritesOnly((f) => !f)}
                        title="Show favorites only"
                    >
                        <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                            <path
                                d="M9 1.5L11.09 6.26L16.18 6.77L12.54 10.14L13.64 15.18L9 12.51L4.36 15.18L5.46 10.14L1.82 6.77L6.91 6.26L9 1.5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                                fill={favoritesOnly ? "currentColor" : "none"}
                            />
                        </svg>
                    </button>
                </div>
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
                    dates={visibleDates}
                    entryMeta={entryMeta}
                    pathname={pathname}
                    bottomRef={bottomRef}
                />
            )}
            {view === "grid" && (
                <GridView
                    dates={visibleDates}
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
