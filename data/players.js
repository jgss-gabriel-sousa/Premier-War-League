export const BANNED_PLAYERS = ["Renally"];

export const PLAYER_PHOTOS = {
    Aninha: ["Aninha.webp"],
    Bilu: ["Bilu.webp", "Bilu_1.webp"],
    Bruno: ["Bruno.webp", "Bruno_1.webp"],
    Coxinha: ["Coxinha.webp"],
    Divinha: ["Divinha.webp"],
    Giovanna: ["Giovanna.webp"],
    Itonga: ["Itonga.webp"],
    Luiz: ["Luiz.webp"],
    Myllena: ["Myllena.webp"],
    Ravena: ["Ravena.webp"],
};

export const ARMY_COLORS = {
    Pretas: { hex: "#1f1f24", text: "#ffffff", border: "#1f1f24" },
    Brancas: { hex: "#f7f7f7", text: "#222222", border: "#bdbdbd" },
    Vermelhas: { hex: "#d92b2b", text: "#ffffff", border: "#b71c1c" },
    Azuis: { hex: "#1d6fe2", text: "#ffffff", border: "#1557b0" },
    Verdes: { hex: "#1e9e52", text: "#ffffff", border: "#157a3e" },
    Amarelas: { hex: "#f5c400", text: "#222222", border: "#c79e00" },
};

export function getPlayerPhotos(name) {
    const files = PLAYER_PHOTOS[name];
    if (!files || files.length === 0) return [];
    return files.map(file => `./data/img/players/${file}`);
}

export function getFallbackAvatarDataUri(name) {
    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || "")
        .join("");

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const palette = ["#37003c", "#5e17eb", "#0b6e4f", "#b5179e", "#1d4ed8", "#9a3412", "#0f766e"];
    const bg = palette[Math.abs(hash) % palette.length];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="44" font-weight="700">${initials}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
