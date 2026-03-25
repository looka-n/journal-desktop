import Link from "next/link";
import styles from "./SidebarCard.module.css";

interface Props {
    date: string;
    title: string;
    cover: string | null;
    active: boolean;
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr + "T00:00:00");
    return {
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        display: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
}

export default function SidebarCard({ date, title, cover, active }: Props) {
    const { day, display } = formatDate(date);

    return (
        <Link href={`/${date}`} className={`${styles.card} ${active ? styles.active : ""}`}>
            <div className={styles.image}>
                {cover
                    ? <img src={cover} alt="cover" />
                    : <div className={styles.placeholder} />
                }
            </div>
            <div className={styles.text}>
                <span className={styles.day}>{day}</span>
                <span className={styles.date}>{display}</span>
                {title && <span className={styles.title}>{title}</span>}
            </div>
        </Link>
    );
}
