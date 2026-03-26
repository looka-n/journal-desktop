"use client";

import { useEffect, useRef } from "react";
import { MediaItem, getEmbedUrl } from "@/lib/media";
import styles from "./EmbedSlide.module.css";

interface Props {
    item: Extract<MediaItem, { type: "embed" }>;
}

export default function EmbedSlide({ item }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const embedUrl = getEmbedUrl(item);

    useEffect(() => {
        if (item.platform !== "twitter" && item.platform !== "tiktok") return;
        if (!ref.current || !embedUrl) return;

        const script = document.createElement("script");
        script.async = true;

        if (item.platform === "twitter") {
            ref.current.innerHTML = `<blockquote class="twitter-tweet"><a href="${embedUrl}"></a></blockquote>`;
            script.src = "https://platform.twitter.com/widgets.js";
        }

        if (item.platform === "tiktok") {
            const videoId = embedUrl.match(/video\/(\d+)/)?.[1];
            if (videoId) {
                ref.current.innerHTML = `<blockquote class="tiktok-embed" cite="${embedUrl}" data-video-id="${videoId}"><section></section></blockquote>`;
                script.src = "https://www.tiktok.com/embed.js";
            }
        }

        ref.current.appendChild(script);
    }, [item, embedUrl]);

    if (!embedUrl) {
        return (
            <div className={styles.unknown}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
            </div>
        );
    }

    if (item.platform === "youtube" || item.platform === "medal") {
        return (
            <iframe
                className={styles.iframe}
                src={embedUrl}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                frameBorder="0"
            />
        );
    }

    return <div ref={ref} className={styles.scriptEmbed} />;
}
