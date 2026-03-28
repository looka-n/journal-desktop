"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

type ModalConfig =
    | { type: "confirm"; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void }
    | { type: "prompt"; message: string; placeholder?: string; confirmLabel?: string; cancelLabel?: string; onConfirm: (val: string) => void }
    | null;

type ToastConfig = { message: string; type: "success" | "error" } | null;

interface EntryContextType {
    refreshSidebar: () => void;
    refreshTrigger: number;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    showModal: (config: Exclude<ModalConfig, null>) => void;
    showToast: (message: string, type: "success" | "error") => void;
}

const EntryContext = createContext<EntryContextType>({
    refreshSidebar: () => { },
    refreshTrigger: 0,
    isEditing: false,
    setIsEditing: () => { },
    showModal: () => { },
    showToast: () => { },
});

export function EntryProvider({ children }: { children: ReactNode }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [modal, setModal] = useState<ModalConfig>(null);
    const [toast, setToast] = useState<ToastConfig>(null);

    const refreshSidebar = useCallback(() => {
        setRefreshTrigger((n) => n + 1);
    }, []);

    const showModal = useCallback((config: Exclude<ModalConfig, null>) => {
        setModal(config);
    }, []);

    const showToast = useCallback((message: string, type: "success" | "error") => {
        setToast({ message, type });
    }, []);

    function closeModal() {
        setModal(null);
    }

    return (
        <EntryContext.Provider value={{ refreshSidebar, refreshTrigger, isEditing, setIsEditing, showModal, showToast }}>
            {children}
            {modal && (
                modal.type === "confirm" ? (
                    <Modal
                        type="confirm"
                        message={modal.message}
                        confirmLabel={modal.confirmLabel}
                        cancelLabel={modal.cancelLabel}
                        onConfirm={() => { modal.onConfirm(); closeModal(); }}
                        onCancel={closeModal}
                    />
                ) : (
                    <Modal
                        type="prompt"
                        message={modal.message}
                        placeholder={modal.placeholder}
                        confirmLabel={modal.confirmLabel}
                        cancelLabel={modal.cancelLabel}
                        onConfirm={(val) => { modal.onConfirm(val); closeModal(); }}
                        onCancel={closeModal}
                    />
                )
            )}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => setToast(null)}
                />
            )}
        </EntryContext.Provider>
    );
}

export function useEntryContext() {
    return useContext(EntryContext);
}
