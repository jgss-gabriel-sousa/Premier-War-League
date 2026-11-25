import { getFallbackAvatarDataUri, getPlayerPhotos } from "../data/players.js";
import { escapeHtml, openModal, renderArmyColorBadge, renderFormBadges } from "./ui.js";

function computeFavoriteColor(colorsHistory) {
    if (!colorsHistory || colorsHistory.length === 0) return { colors: [], count: 0 };

    const counts = {};
    for (const color of colorsHistory) {
        counts[color] = (counts[color] ?? 0) + 1;
    }

    let max = 0;
    let topColors = [];
    for (const [color, count] of Object.entries(counts)) {
        if (count > max) {
            max = count;
            topColors = [color];
        } else if (count === max) {
            topColors.push(color);
        }
    }

    return { colors: topColors, count: max };
}

function getTopTeammate(teammates) {
    const entries = Object.entries(teammates ?? {});
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return { name: entries[0][0], count: entries[0][1] };
}

function renderHeadToHead(headToHead) {
    const rows = Object.entries(headToHead ?? {})
        .map(([opponent, stats]) => ({
            opponent,
            ...stats,
            total: stats.wins + stats.losses + stats.ties,
        }))
        .sort((a, b) => b.total - a.total || b.wins - a.wins)
        .slice(0, 6);

    if (rows.length === 0) return "";

    return `
        <section class="profile-section">
            <h3>Confronto Direto (Top Rivais)</h3>
            <div class="table-scroll">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>Adversário</th>
                            <th>À frente</th>
                            <th>Atrás</th>
                            <th>Empates</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(r => {
                                const diff = r.wins - r.losses;
                                const diffLabel = diff > 0 ? `+${diff}` : `${diff}`;
                                const diffClass = diff > 0 ? "stat-pos" : diff < 0 ? "stat-neg" : "muted";
                                return `
                                    <tr>
                                        <td><strong>${escapeHtml(r.opponent)}</strong></td>
                                        <td>${r.wins}</td>
                                        <td>${r.losses}</td>
                                        <td>${r.ties}</td>
                                        <td class="${diffClass}">${diffLabel}</td>
                                    </tr>
                                `;
                            })
                            .join("")}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

function renderMatchHistory(matchLog) {
    if (!matchLog || matchLog.length === 0) return "";

    const reversed = [...matchLog].reverse();
    return `
        <section class="profile-section">
            <h3>Histórico de Partidas (${reversed.length})</h3>
            <div class="table-scroll">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Pos</th>
                            <th>Cor</th>
                            <th>Pts</th>
                            <th>Territ.</th>
                            <th>Tropas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reversed
                            .map(
                                m => `
                                <tr class="clickable-row" data-open-match="${m.matchId}" tabindex="0" role="button">
                                    <td>${escapeHtml(m.date)}</td>
                                    <td><strong>${m.position}º</strong></td>
                                    <td>${renderArmyColorBadge(m.color)}</td>
                                    <td>${m.points}/${m.maxPoints}</td>
                                    <td>${m.territories}</td>
                                    <td>${m.troops}</td>
                                </tr>
                            `
                            )
                            .join("")}
                    </tbody>
                </table>
            </div>
        </section>
    `;
}

/**
 * Abre o modal de perfil detalhado de um jogador.
 * @param {object} player
 * @param {{ onOpenMatch?: (matchId: number) => void }} callbacks
 */
export function openPlayerProfile(player, { onOpenMatch } = {}) {
    if (!player) return;

    const meanPosition =
        player.matches > 0
            ? (player.positionsHistory.reduce((acc, p) => acc + p, 0) / player.matches).toFixed(1)
            : "—";

    const winRate = player.matches > 0 ? Math.round((player.victories / player.matches) * 100) : 0;
    const podiumRate = player.matches > 0 ? Math.round((player.podiums / player.matches) * 100) : 0;
    const avgTerritories = player.matches > 0 ? (player.totalTerritories / player.matches).toFixed(1) : "0";
    const avgTroops = player.matches > 0 ? (player.totalTroops / player.matches).toFixed(1) : "0";

    const favColor = computeFavoriteColor(player.colorsHistory);
    const favColorHtml =
        favColor.colors.length === 0
            ? "—"
            : favColor.colors.length > 2
              ? `Variadas (${favColor.count}x)`
              : `${favColor.colors.map(renderArmyColorBadge).join(" ")} <span class="muted">(${favColor.count}x)</span>`;

    const leaderHtml = player.leaderTime
        ? `${player.leaderTime} dia${player.leaderTime > 1 ? "s" : ""}${
              player.isActualLeader ? ' <span class="leader-pill">Líder atual</span>' : ""
          }`
        : "Nunca liderou";

    const topTeammate = getTopTeammate(player.teammates);

    const photos = getPlayerPhotos(player.name);
    const fallbackAvatar = getFallbackAvatarDataUri(player.name);

    let mediaHtml;
    if (photos.length > 1) {
        mediaHtml = `
            <div class="carousel" aria-label="Fotos de ${escapeHtml(player.name)}">
                <div class="carousel-track">
                    ${photos
                        .map(
                            (src, idx) =>
                                `<img src="${escapeHtml(src)}" alt="Foto ${idx + 1} de ${escapeHtml(player.name)}" class="carousel-item" loading="lazy">`
                        )
                        .join("")}
                </div>
                <button type="button" class="carousel-btn prev" aria-label="Foto anterior">&#8249;</button>
                <button type="button" class="carousel-btn next" aria-label="Próxima foto">&#8250;</button>
                <div class="carousel-dots" aria-hidden="true">
                    ${photos.map((_, idx) => `<span class="carousel-dot ${idx === 0 ? "is-active" : ""}"></span>`).join("")}
                </div>
            </div>
        `;
    } else {
        const singleSrc = photos[0] ?? fallbackAvatar;
        mediaHtml = `<img class="profile-photo" src="${escapeHtml(singleSrc)}" alt="Foto de ${escapeHtml(player.name)}" loading="lazy">`;
    }

    const bodyHtml = `
        <div class="profile-container">
            <div class="profile-hero">
                ${mediaHtml}
                <div class="profile-summary">
                    <div class="profile-badges">
                        <span class="pill pill-purple">${player.position}º no Ranking</span>
                        ${
                            player.qualified
                                ? `<span class="pill pill-accent">${player.roundedPercentage}% de aproveitamento</span>`
                                : `<span class="pill pill-muted">Em qualificação (${player.matches}/3 partidas)</span>`
                        }
                    </div>
                    <div class="profile-form-row">
                        <span class="muted">Forma recente:</span>
                        ${renderFormBadges(player.recentForm)}
                    </div>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Pontos Obtidos</span>
                    <strong class="stat-value">${player.pts} / ${player.maxPts}</strong>
                    <span class="stat-sub">${player.roundedPercentage}% aproveitamento</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Posição Média</span>
                    <strong class="stat-value">${meanPosition}º</strong>
                    <span class="stat-sub">em ${player.matches} partida${player.matches !== 1 ? "s" : ""}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Vitórias</span>
                    <strong class="stat-value">${player.victories} (${winRate}%)</strong>
                    <span class="stat-sub">Melhor sequência: ${player.bestWinStreak}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Pódios</span>
                    <strong class="stat-value">${player.podiums} (${podiumRate}%)</strong>
                    <span class="stat-sub">Partidas solo com 3+ jogadores</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Cor mais usada</span>
                    <div class="stat-value stat-value--sm">${favColorHtml}</div>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Tempo na Liderança</span>
                    <strong class="stat-value stat-value--sm">${leaderHtml}</strong>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Média por Partida</span>
                    <strong class="stat-value stat-value--sm">${avgTerritories} territ. • ${avgTroops} tropas</strong>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Parceiro Frequente</span>
                    <strong class="stat-value stat-value--sm">${
                        topTeammate ? `${escapeHtml(topTeammate.name)} (${topTeammate.count}x)` : "—"
                    }</strong>
                </div>
            </div>

            ${renderHeadToHead(player.headToHead)}
            ${renderMatchHistory(player.matchLog)}
        </div>
    `;

    openModal({
        title: player.name,
        bodyHtml,
        size: "lg",
        onRender: dialog => {
            if (photos.length > 1) {
                const track = dialog.querySelector(".carousel-track");
                const dots = dialog.querySelectorAll(".carousel-dot");
                const nextBtn = dialog.querySelector(".carousel-btn.next");
                const prevBtn = dialog.querySelector(".carousel-btn.prev");
                let index = 0;

                const update = () => {
                    track.style.transform = `translateX(-${index * 100}%)`;
                    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
                };

                nextBtn.addEventListener("click", () => {
                    index = (index + 1) % photos.length;
                    update();
                });

                prevBtn.addEventListener("click", () => {
                    index = (index - 1 + photos.length) % photos.length;
                    update();
                });
            }

            if (typeof onOpenMatch === "function") {
                dialog.querySelectorAll("[data-open-match]").forEach(row => {
                    const trigger = () => onOpenMatch(Number(row.dataset.openMatch));
                    row.addEventListener("click", trigger);
                    row.addEventListener("keydown", e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            trigger();
                        }
                    });
                });
            }
        },
    });
}
