import SidebarCard from "../SidebarCard";

interface EntryMeta {
    title: string;
    cover: string | null;
}

interface Props {
    dates: string[];
    entryMeta: Record<string, EntryMeta>;
    pathname: string;
    bottomRef: React.RefObject<HTMLDivElement>;
}

export default function ListView({ dates, entryMeta, pathname, bottomRef }: Props) {
    return (
        <>
            {dates.map((date, index) => (
                <SidebarCard
                    key={date}
                    date={date}
                    title={entryMeta[date]?.title ?? ""}
                    cover={entryMeta[date]?.cover ?? null}
                    active={pathname === `/${date}`}
                    index={index}
                />
            ))}
            <div ref={bottomRef} />
        </>
    );
}
