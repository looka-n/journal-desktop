"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./Carousel.module.css";

interface Props {
    images: string[];
}

type Direction = "left" | "right" | null;

export default function Carousel({ images }: Props) {
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
        navigate((current - 1 + images.length) % images.length, "left");
    }, [current, images.length, animating]);

    const nextSlide = useCallback(() => {
        navigate((current + 1) % images.length, "right");
    }, [current, images.length, animating]);

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

    if (images.length === 0) return null;

    return (
        <>
            <div className={styles.carousel}>
                {/* outgoing image */}
                {prev_ !== null && (
                    <img
                        src={images[prev_]}
                        alt="outgoing"
                        className={`${styles.image} ${direction === "right" ? styles.exitLeft : styles.exitRight}`}
                    />
                )}
                {/* incoming image */}
                <img
                    key={current}
                    src={images[current]}
                    alt={`image ${current + 1}`}
                    className={`${styles.image} ${animating ? (direction === "right" ? styles.enterRight : styles.enterLeft) : styles.settled}`}
                    onClick={() => !animating && setLightbox(true)}
                />

                {images.length > 1 && (
                    <>
                        <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prevSlide}>‹</button>
                        <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={nextSlide}>›</button>
                        <div className={styles.dots}>
                            {images.map((_, i) => (
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

            {lightbox && (
                <div className={styles.lightboxOverlay} onClick={() => setLightbox(false)}>
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <img src={images[current]} alt={`image ${current + 1}`} className={styles.lightboxImage} />
                        <button className={styles.lightboxClose} onClick={() => setLightbox(false)}>×</button>
                        {images.length > 1 && (
                            <>
                                <button className={`${styles.lightboxArrow} ${styles.lightboxLeft}`} onClick={prevSlide}>‹</button>
                                <button className={`${styles.lightboxArrow} ${styles.lightboxRight}`} onClick={nextSlide}>›</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
