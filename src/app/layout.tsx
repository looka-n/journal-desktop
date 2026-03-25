import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";
import styles from "./layout.module.css";

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
                <Sidebar />
                <main className={styles.main}>
                    {children}
                </main>
            </body>
        </html>
    );
}
