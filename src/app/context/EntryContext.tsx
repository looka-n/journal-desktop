"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface EntryContextType {
    refreshSidebar: () => void;
    refreshTrigger: number;
}

const EntryContext = createContext<EntryContextType>({
    refreshSidebar: () => { },
    refreshTrigger: 0,
});

export function EntryProvider({ children }: { children: React.ReactNode }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshSidebar = useCallback(() => {
        setRefreshTrigger((n) => n + 1);
    }, []);

    return (
        <EntryContext.Provider value={{ refreshSidebar, refreshTrigger }}>
            {children}
        </EntryContext.Provider>
    );
}

export function useEntryContext() {
    return useContext(EntryContext);
}
