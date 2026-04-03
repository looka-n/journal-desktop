import SidebarCard from "../SidebarCard";
import styles from "./ListView.module.css";

interface EntryMeta {
    title: string;
    cover: string | null;
    favorite: boolean;
}

interface Props {
    dates: string[];
    entryMeta: Record<string, EntryMeta>;
    pathname: string;
    bottomRef: React.RefObject<HTMLDivElement | null>;
}

function getMonthLabel(dateStr: string): string {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        month: "long", year: "numeric"
    });
}

export default function ListView({ dates, entryMeta, pathname, bottomRef }: Props) {
    let lastMonth = "";

    return (
        <>
            {dates.map((date, index) => {
                const month = getMonthLabel(date);
                const showHeader = month !== lastMonth;
                lastMonth = month;

                return (
                    <div key={date}>
                        {showHeader && (
                            <div className={styles.monthHeader}>{month}</div>
                        )}
                        <SidebarCard
                            date={date}
                            title={entryMeta[date]?.title ?? ""}
                            cover={entryMeta[date]?.cover ?? null}
                            active={pathname === `/${date}`}
                            index={index}
                            favorite={entryMeta[date]?.favorite ?? false}
                        />
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </>
    );
}
