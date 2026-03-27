"use client";

import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";

interface ConfirmProps {
    type: "confirm";
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

interface PromptProps {
    type: "prompt";
    message: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

type ModalProps = ConfirmProps | PromptProps;

export default function Modal(props: ModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.type === "prompt") inputRef.current?.focus();
    }, [props.type]);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") props.onCancel();
            if (e.key === "Enter" && props.type === "prompt") {
                props.onConfirm(inputRef.current?.value ?? "");
            }
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [props]);

    return (
        <div className={styles.overlay} onClick={props.onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <p className={styles.message}>{props.message}</p>
                {props.type === "prompt" && (
                    <input
                        ref={inputRef}
                        className={styles.input}
                        placeholder={props.placeholder ?? ""}
                    />
                )}
                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={props.onCancel}>
                        {props.cancelLabel ?? "Cancel"}
                    </button>
                    <button
                        className={styles.confirmBtn}
                        onClick={() => {
                            if (props.type === "prompt") {
                                props.onConfirm(inputRef.current?.value ?? "");
                            } else {
                                props.onConfirm();
                            }
                        }}
                    >
                        {props.confirmLabel ?? "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
