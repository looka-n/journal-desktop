import type { Metadata } from "next";
import styles from "./layout.module.css";
import Link from 'next/link'

export const metadata: Metadata = {
    title: "Journal",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={styles.shell}>
                <aside className={styles.sidebar}>
                    <ul>
                        <Link href="/2026-03-23"><li>2026-03-23</li></Link>
                        <Link href="/2026-03-22"><li>2026-03-22</li></Link>
                        <Link href="/2026-03-21"><li>2026-03-21</li></Link>
                    </ul>
                </aside>
                <main className={styles.main}>
                    {children}
                </main>
            </body>
        </html>
    );
}
