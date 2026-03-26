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
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        number: date.getDate().toString(),
        year: date.getFullYear().toString(),
        display: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
}

export default function SidebarCard({ date, title, cover, active }: Props) {
    const { day, month, number, year } = formatDate(date);

    return (
        <Link href={`/${date}`} className={`${styles.card} ${active ? styles.active : ""}`}>
            <div className={styles.image}>
                {cover
                    ? <img src={cover} alt="cover" />
                    : <div className={styles.placeholder} />
                }
            </div>
            <div className={styles.text}>
                <div className={styles.left}>
                    <span className={styles.day}>{day}</span>
                    {title && <span className={styles.title}>{title}</span>}
                </div>
                <div className={styles.dateStack}>
                    <span className={styles.month}>{month}</span>
                    <span className={styles.number}>{number}</span>
                    <span className={styles.year}>{year}</span>
                </div>
            </div>
        </Link>
    );
}
