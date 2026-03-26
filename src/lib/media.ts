export type MediaItem =
    | { type: "image"; url: string }
    | { type: "embed"; platform: "youtube" | "medal" | "twitter" | "tiktok" | "unknown"; url: string };

export function normalizeMedia(raw: unknown[]): MediaItem[] {
    return raw.map((item) => {
        if (typeof item === "string") return { type: "image", url: item };
        return item as MediaItem;
    });
}

export function detectPlatform(url: string): MediaItem["platform"] {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("medal.tv")) return "medal";
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
    if (url.includes("tiktok.com")) return "tiktok";
    return "unknown";
}

export function getEmbedUrl(item: Extract<MediaItem, { type: "embed" }>): string | null {
    const { platform, url } = item;

    if (platform === "youtube") {
        const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }

    if (platform === "medal") {
        // Medal clip URLs: https://medal.tv/games/.../clips/CLIP_ID
        // Medal embed: https://medal.tv/clip/CLIP_ID/auto
        const match = url.match(/clips\/([^/?]+)/);
        return match ? `https://medal.tv/clip/${match[1]}/auto` : null;
    }

    // Twitter and TikTok use script-based embeds, return original url as identifier
    if (platform === "twitter" || platform === "tiktok") return url;

    return url;
}
