"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import styles from "../layout.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            {sidebarOpen && (
                <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
            )}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className={styles.main}>
                {children}
            </main>
            <button
                className={styles.menuBtn}
                onClick={() => setSidebarOpen((o) => !o)}
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="4" width="16" height="2" rx="1" fill="currentColor" />
                    <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor" />
                    <rect x="2" y="14" width="16" height="2" rx="1" fill="currentColor" />
                </svg>
            </button>
        </>
    );
}
