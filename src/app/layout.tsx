import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "./components/Sidebar";
import styles from "./layout.module.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
            <body className={`${styles.shell} ${inter.className}`}>
                <Sidebar />
                <main className={styles.main}>
                    {children}
                </main>
            </body>
        </html>
    );
}
