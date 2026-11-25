import { BANNED_PLAYERS } from "../data/players.js";
import { pointsFunc } from "./pointsFunc.js";
import { escapeHtml, openModal, renderArmyColorBadge } from "./ui.js";

/**
 * Abre o modal com os detalhes completos de uma partida.
 * Jogadores em BANNED_PLAYERS nunca são exibidos na tela.
 * @param {object} match
 */
export function openMatchModal(match) {
    if (!match) return;

    const imageHtml = match.img
        ? `
            <a class="match-photo-link" target="_blank" rel="noopener noreferrer" href="./data/img/matches/${escapeHtml(match.img)}.webp">
                <img class="match-photo" src="./data/img/matches/${escapeHtml(match.img)}.webp" alt="Tabuleiro da partida ${escapeHtml(match.title)}" loading="lazy">
            </a>
        `
        : `<div class="match-photo-placeholder">Foto do tabuleiro não registrada para esta partida.</div>`;

    const rowsHtml = match.ranking
        .map(entry => {
            const visiblePlayers = entry.players.filter(p => !BANNED_PLAYERS.includes(p.name));
            if (visiblePlayers.length === 0) return "";

            const isWinner = entry.position === 1;
            const rowClass = isWinner ? ' class="match-result-winner"' : "";
            const pts = pointsFunc(entry.position, match.numberOfPlayers, match.inTeamType);

            return visiblePlayers
                .map((player, idx) => {
                    return `
                        <tr${rowClass}>
                            <td>${idx === 0 ? `${entry.position}º` : ""}</td>
                            <td><strong>${escapeHtml(player.name)}</strong></td>
                            <td>${renderArmyColorBadge(player.color)}</td>
                            <td>${pts}</td>
                            <td>${idx === 0 ? entry.territories : ""}</td>
                            <td>${idx === 0 ? Math.round(entry.troops) : ""}</td>
                        </tr>
                    `;
                })
                .join("");
        })
        .join("");

    const modeBadge = match.inTeam
        ? `<span class="pill pill-purple">${escapeHtml(match.inTeamType)}</span>`
        : `<span class="pill pill-muted">Solo (${match.numberOfPlayers} jogadores)</span>`;

    const bodyHtml = `
        <div class="match-modal-content">
            ${imageHtml}
            <div class="match-meta">
                ${modeBadge}
                <p><strong>Objetivo / Vitória:</strong> ${escapeHtml(match.victory)}</p>
            </div>
            <div class="table-scroll">
                <table id="match-result" class="mini-table">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Jogador</th>
                            <th>Cor</th>
                            <th>Pontos</th>
                            <th>Territórios</th>
                            <th>Tropas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    openModal({
        title: match.title,
        bodyHtml,
        size: "md",
    });
}

/**
 * Renderiza a lista de partidas recentes filtrada por temporada.
 */
export function renderMatchesList(container, processedMatches, { season = "all" } = {}) {
    if (!container) return;

    const filtered = processedMatches
        .filter(match => season === "all" || match.season === season)
        .reverse();

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="panel-header">
                <h2>Partidas</h2>
                <span class="count-badge">0</span>
            </div>
            <p class="empty-state">Nenhuma partida registrada para este filtro.</p>
        `;
        return;
    }

    const cardsHtml = filtered
        .map(match => {
            const typeTag = match.inTeam
                ? `<span class="match-tag tag-team">${escapeHtml(match.inTeamType)}</span>`
                : `<span class="match-tag tag-solo">${match.numberOfPlayers}P</span>`;

            return `
                <button type="button" class="match-card" data-match-id="${match.id}">
                    <div class="match-card-top">
                        <span class="match-date">${escapeHtml(match.displayDate)}</span>
                        ${typeTag}
                    </div>
                    <h3 class="match-card-title">${escapeHtml(match.location)}</h3>
                    <p class="match-card-winner">Vencedor: <strong>${escapeHtml(match.winner)}</strong></p>
                </button>
            `;
        })
        .join("");

    container.innerHTML = `
        <div class="panel-header">
            <h2>Partidas</h2>
            <span class="count-badge">${filtered.length}</span>
        </div>
        <div class="matches-scroll">${cardsHtml}</div>
    `;

    container.querySelectorAll(".match-card").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.matchId);
            const match = processedMatches.find(m => m.id === id);
            openMatchModal(match);
        });
    });
}
