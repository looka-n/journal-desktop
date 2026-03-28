"use client";

import { useEffect } from "react";
import styles from "./Toast.module.css";

interface Props {
    message: string;
    type: "success" | "error";
    onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: Props) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`${styles.toast} ${type === "error" ? styles.error : styles.success}`}>
            <span>{message}</span>
            <button className={styles.close} onClick={onDismiss}>×</button>
        </div>
    );
}
