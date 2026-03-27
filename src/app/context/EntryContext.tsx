"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Modal from "../components/Modal";

type ModalConfig =
    | { type: "confirm"; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void }
    | { type: "prompt"; message: string; placeholder?: string; confirmLabel?: string; cancelLabel?: string; onConfirm: (val: string) => void }
    | null;

interface EntryContextType {
    refreshSidebar: () => void;
    refreshTrigger: number;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    showModal: (config: Exclude<ModalConfig, null>) => void;
}

const EntryContext = createContext<EntryContextType>({
    refreshSidebar: () => { },
    refreshTrigger: 0,
    isEditing: false,
    setIsEditing: () => { },
    showModal: () => { },
});

export function EntryProvider({ children }: { children: ReactNode }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [modal, setModal] = useState<ModalConfig>(null);

    const refreshSidebar = useCallback(() => {
        setRefreshTrigger((n) => n + 1);
    }, []);

    const showModal = useCallback((config: Exclude<ModalConfig, null>) => {
        setModal(config);
    }, []);

    function closeModal() {
        setModal(null);
    }

    return (
        <EntryContext.Provider value={{ refreshSidebar, refreshTrigger, isEditing, setIsEditing, showModal }}>
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
        </EntryContext.Provider>
    );
}

export function useEntryContext() {
    return useContext(EntryContext);
}
