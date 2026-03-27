"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface EntryContextType {
    refreshSidebar: () => void;
    refreshTrigger: number;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
}

const EntryContext = createContext<EntryContextType>({
    refreshSidebar: () => { },
    refreshTrigger: 0,
    isEditing: false,
    setIsEditing: () => { },
});

export function EntryProvider({ children }: { children: React.ReactNode }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    const refreshSidebar = useCallback(() => {
        setRefreshTrigger((n) => n + 1);
    }, []);

    return (
        <EntryContext.Provider value={{ refreshSidebar, refreshTrigger, isEditing, setIsEditing }}>
            {children}
        </EntryContext.Provider>
    );
}

export function useEntryContext() {
    return useContext(EntryContext);
}
