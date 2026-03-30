"use client";

import { useState, useEffect, useCallback } from "react";
import { MediaItem } from "@/lib/media";
import EmbedSlide from "./EmbedSlide";
import styles from "./Carousel.module.css";

interface Props {
    items: MediaItem[];
}

type Direction = "left" | "right" | null;

export default function Carousel({ items }: Props) {
    const [current, setCurrent] = useState(0);
    const [prev_, setPrev] = useState<number | null>(null);
    const [direction, setDirection] = useState<Direction>(null);
    const [animating, setAnimating] = useState(false);
    const [lightbox, setLightbox] = useState(false);

    function navigate(newIndex: number, dir: Direction) {
        if (animating || newIndex === current) return;
        setDirection(dir);
        setPrev(current);
        setAnimating(true);
        setCurrent(newIndex);
        setTimeout(() => {
            setPrev(null);
            setAnimating(false);
            setDirection(null);
        }, 350);
    }


    const prevSlide = useCallback(() => {
        if (current === 0) return;
        navigate(current - 1, "left");
    }, [current, animating]);

    const nextSlide = useCallback(() => {
        if (current === items.length - 1) return;
        navigate(current + 1, "right");
    }, [current, items.length, animating]);

    useEffect(() => {
        if (!lightbox) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === "ArrowLeft") prevSlide();
            if (e.key === "ArrowRight") nextSlide();
            if (e.key === "Escape") setLightbox(false);
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [lightbox, prevSlide, nextSlide]);

    if (!items || items.length === 0) return null;

    const currentItem = items[current];
    const prevItem = prev_ !== null ? items[prev_] : null;

    function renderSlide(item: MediaItem, className: string, onClick?: () => void) {
        if (item.type === "image") {
            return (
                <img
                    src={item.url}
                    alt="entry media"
                    className={`${styles.image} ${className}`}
                    onClick={onClick}
                />
            );
        }
        return (
            <div className={`${styles.image} ${className}`}>
                <EmbedSlide item={item} />
            </div>
        );
    }

    return (
        <>
            <div className={styles.carousel}>
                {prevItem && renderSlide(prevItem, direction === "right" ? styles.exitLeft : styles.exitRight)}
                {renderSlide(
                    currentItem,
                    animating ? (direction === "right" ? styles.enterRight : styles.enterLeft) : styles.settled,
                    currentItem.type === "image" && !animating ? () => setLightbox(true) : undefined
                )}
                {items.length > 1 && (
                    <>
                        <button
                            className={`${styles.arrow} ${styles.arrowLeft}`}
                            onClick={prevSlide}
                            disabled={current === 0}
                        >‹</button>
                        <button
                            className={`${styles.arrow} ${styles.arrowRight}`}
                            onClick={nextSlide}
                            disabled={current === items.length - 1}
                        >›</button>
                        <div className={styles.dots}>
                            {items.map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                                    onClick={() => navigate(i, i > current ? "right" : "left")}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {lightbox && currentItem.type === "image" && (
                <div className={styles.lightboxOverlay} onClick={() => setLightbox(false)}>
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <img src={currentItem.url} alt="fullscreen" className={styles.lightboxImage} />
                        <button className={styles.lightboxClose} onClick={() => setLightbox(false)}>×</button>
                        {items.length > 1 && (
                            <>
                                <button
                                    className={`${styles.lightboxArrow} ${styles.lightboxLeft}`}
                                    onClick={prevSlide}
                                    disabled={current === 0}
                                >‹</button>
                                <button
                                    className={`${styles.lightboxArrow} ${styles.lightboxRight}`}
                                    onClick={nextSlide}
                                    disabled={current === items.length - 1}
                                >›</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
