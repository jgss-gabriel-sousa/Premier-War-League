import { ARMY_COLORS, getFallbackAvatarDataUri, getPlayerPhotos } from "../data/players.js";

export function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function getPrimaryAvatar(name) {
    const photos = getPlayerPhotos(name);
    return photos[0] ?? getFallbackAvatarDataUri(name);
}

export function renderArmyColorBadge(colorName) {
    const color = ARMY_COLORS[colorName];
    if (!color) {
        return `<span class="color-badge">${escapeHtml(colorName)}</span>`;
    }
    return `<span class="color-badge"><span class="color-dot" style="background:${color.hex};border-color:${color.border}" aria-hidden="true"></span>${escapeHtml(colorName)}</span>`;
}

export function renderFormBadges(recentForm = []) {
    const lastFive = recentForm.slice(-5);
    if (lastFive.length === 0) return `<span class="muted">—</span>`;

    const labels = {
        W: { text: "V", title: "Vitória", cls: "form-win" },
        P: { text: "P", title: "Pódio (2º/3º)", cls: "form-podium" },
        L: { text: "D", title: "Fora do pódio", cls: "form-loss" },
    };

    return `<div class="form-badges" aria-label="Forma recente">${lastFive
        .map(code => {
            const info = labels[code] ?? labels.L;
            return `<span class="form-badge ${info.cls}" title="${info.title}">${info.text}</span>`;
        })
        .join("")}</div>`;
}

let dialogEl = null;

function ensureDialog() {
    if (dialogEl) return dialogEl;
    dialogEl = document.querySelector("#app-modal");
    if (!dialogEl) {
        dialogEl = document.createElement("dialog");
        dialogEl.id = "app-modal";
        dialogEl.className = "app-modal";
        document.body.appendChild(dialogEl);
    }

    dialogEl.addEventListener("click", event => {
        if (event.target === dialogEl) {
            dialogEl.close();
        }
    });

    return dialogEl;
}

export function openModal({ title, bodyHtml, size = "md", onRender }) {
    const dialog = ensureDialog();
    dialog.className = `app-modal app-modal--${size}`;
    dialog.innerHTML = `
        <div class="modal-surface">
            <header class="modal-header">
                <h2 class="modal-title">${escapeHtml(title)}</h2>
                <button type="button" class="modal-close" aria-label="Fechar janela">&times;</button>
            </header>
            <div class="modal-body">${bodyHtml}</div>
        </div>
    `;

    dialog.querySelector(".modal-close").addEventListener("click", () => dialog.close());

    if (!dialog.open) {
        dialog.showModal();
    }

    if (typeof onRender === "function") {
        onRender(dialog);
    }
}

export function closeModal() {
    if (dialogEl && dialogEl.open) {
        dialogEl.close();
    }
}
