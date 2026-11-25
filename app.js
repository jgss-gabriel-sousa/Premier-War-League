import { renderEvolutionChart } from "./scripts/chart.js";
import { openMatchModal, renderMatchesList } from "./scripts/lastResults.js";
import { sortRankingList } from "./scripts/orderRanking.js";
import { processMatches } from "./scripts/processMatches.js";
import { openPlayerProfile } from "./scripts/profiles.js";
import { computeRanking } from "./scripts/ranking.js";
import { escapeHtml, getPrimaryAvatar, openModal, renderFormBadges } from "./scripts/ui.js";

const processedMatches = processMatches();

const state = {
    season: "all",
    sortBy: "position",
    sortDir: "asc",
    currentRanking: {},
};

const elements = {
    table: document.querySelector("#main-table > table"),
    rankingHeading: document.querySelector("#ranking-heading"),
    results: document.querySelector("#results"),
    evolutionChart: document.querySelector("#evolution-chart"),
    seasonFilter: document.querySelector("#season-filter"),
    helpPoints: document.querySelector("#help-points"),
    leagueSummary: document.querySelector("#league-summary"),
};

function populateSeasons() {
    const seasons = [...new Set(processedMatches.map(m => m.season))].sort((a, b) => b.localeCompare(a));
    for (const season of seasons) {
        const option = document.createElement("option");
        option.value = season;
        option.textContent = `Temporada ${season}`;
        elements.seasonFilter.appendChild(option);
    }
}

function getMedalClass(position) {
    if (position === 1) return "medal-badge gold-medal";
    if (position === 2) return "medal-badge silver-medal";
    if (position === 3) return "medal-badge bronze-medal";
    return "medal-badge";
}

function renderSortIndicator(colKey) {
    if (state.sortBy !== colKey) return '<span class="sort-icon" aria-hidden="true">⇅</span>';
    return state.sortDir === "asc"
        ? '<span class="sort-icon is-active" aria-hidden="true">▲</span>'
        : '<span class="sort-icon is-active" aria-hidden="true">▼</span>';
}

function renderTable(rankingObj) {
    const rows = sortRankingList(rankingObj, state.sortBy, state.sortDir);

    if (rows.length === 0) {
        elements.table.innerHTML = `<tbody><tr><td class="empty-state">Nenhuma partida encontrada para esta temporada.</td></tr></tbody>`;
        return;
    }

    const columns = [
        { key: "position", label: "Pos", defaultDir: "asc" },
        { key: "name", label: "Jogador", defaultDir: "asc", colspan: 2 },
        { key: "pointsPercentage", label: "Apr", defaultDir: "desc" },
        { key: "victories", label: "Vitórias", defaultDir: "desc" },
        { key: "podiums", label: "Pódios", defaultDir: "desc" },
        { key: "matches", label: "Partidas", defaultDir: "desc" },
        { key: null, label: "Forma" },
    ];

    const thead = `
        <thead>
            <tr>
                ${columns
                    .map(col => {
                        const span = col.colspan ? ` colspan="${col.colspan}"` : "";
                        if (!col.key) return `<th${span}>${col.label}</th>`;
                        const ariaSort =
                            state.sortBy === col.key
                                ? state.sortDir === "asc"
                                    ? "ascending"
                                    : "descending"
                                : "none";
                        return `
                            <th${span} aria-sort="${ariaSort}">
                                <button type="button" class="th-sort-btn" data-sort="${col.key}" data-default-dir="${col.defaultDir}">
                                    ${col.label} ${renderSortIndicator(col.key)}
                                </button>
                            </th>
                        `;
                    })
                    .join("")}
            </tr>
        </thead>
    `;

    const tbody = `
        <tbody>
            ${rows
                .map(player => {
                    const avatar = getPrimaryAvatar(player.name);
                    const aprCell = player.qualified
                        ? `<strong>${player.roundedPercentage}%</strong>`
                        : `<span class="unqualified-mark" title="Menos de 3 partidas (${player.matches}/3)">*</span>`;

                    return `
                        <tr class="player-row" data-player="${escapeHtml(player.name)}" tabindex="0" role="button" aria-label="Abrir perfil de ${escapeHtml(player.name)}">
                            <td><span class="${getMedalClass(player.position)}">${player.position}º</span></td>
                            <td class="avatar-cell">
                                <img class="ranking-profile-photo" src="${escapeHtml(avatar)}" alt="Foto de ${escapeHtml(player.name)}" width="44" height="44" loading="lazy">
                            </td>
                            <td class="player-name-cell">
                                ${escapeHtml(player.name)}
                                ${player.isActualLeader ? '<span class="crown-badge" title="Líder atual">★</span>' : ""}
                            </td>
                            <td>${aprCell}</td>
                            <td>${player.victories}</td>
                            <td>${player.podiums}</td>
                            <td>${player.matches}</td>
                            <td class="form-cell">${renderFormBadges(player.recentForm)}</td>
                        </tr>
                    `;
                })
                .join("")}
        </tbody>
    `;

    elements.table.innerHTML = thead + tbody;
}

function updateSummaryBar(matchCount, rankingObj) {
    const playersCount = Object.keys(rankingObj).length;
    const leader = Object.values(rankingObj).find(p => p.position === 1);
    const seasonLabel = state.season === "all" ? "Todas as temporadas" : `Temporada ${state.season}`;

    elements.leagueSummary.textContent = leader
        ? `${seasonLabel} • ${matchCount} partidas • ${playersCount} jogadores • Líder: ${leader.name}`
        : `${seasonLabel} • ${matchCount} partidas`;
}

function renderAll() {
    const { ranking, rankingHistory, matchCount } = computeRanking(processedMatches, {
        season: state.season,
    });
    state.currentRanking = ranking;

    elements.rankingHeading.textContent =
        state.season === "all" ? "Classificação Geral" : `Classificação — Temporada ${state.season}`;

    renderTable(ranking);
    renderEvolutionChart(elements.evolutionChart, rankingHistory, ranking);
    renderMatchesList(elements.results, processedMatches, {
        season: state.season,
    });
    updateSummaryBar(matchCount, ranking);
}

function openHelpModal() {
    const html = `
        <div class="help-content">
            <p>A classificação do ranking geral é determinada pelo <strong>Aproveitamento</strong> total do jogador nas partidas disputadas.</p>
            <div class="formula-box">
                <p><strong>PO</strong> = Pontos Obtidos</p>
                <p><strong>PMax</strong> = Pontos Máximos possíveis nas partidas jogadas</p>
                <p class="formula-highlight">Aproveitamento = (PO / PMax) &times; 100%</p>
            </div>
            <p>O resultado é arredondado para o inteiro mais próximo. Em caso de empate, os critérios de desempate são aplicados na seguinte ordem: <strong>Vitórias</strong>, <strong>Pódios</strong> e <strong>Número de Partidas</strong>.</p>
            <p>Para evitar distorções iniciais, o aproveitamento oficial e a qualificação no ranking exigem a participação em pelo menos <strong>3 partidas</strong> (jogadores abaixo disso aparecem marcados com <strong>*</strong>).</p>
            <h3>Pontuação por Modo</h3>
            <ul class="rules-list">
                <li><strong>Solo (6 jogadores):</strong> 10, 8, 6, 3, 2, 1</li>
                <li><strong>Solo (5 jogadores):</strong> 8, 6, 3, 2, 1</li>
                <li><strong>Solo (4 jogadores):</strong> 6, 3, 2, 1</li>
                <li><strong>Solo (3 jogadores):</strong> 4, 2, 1</li>
                <li><strong>4 Duplas:</strong> 6, 3, 2, 1 &bull; <strong>3 Duplas:</strong> 5, 3, 1 &bull; <strong>2 Duplas / 2 Trios:</strong> 3, 1</li>
            </ul>
        </div>
    `;

    openModal({
        title: "Explicação da Pontuação",
        bodyHtml: html,
        size: "md",
    });
}

function bindEvents() {
    elements.seasonFilter.addEventListener("change", e => {
        state.season = e.target.value;
        state.sortBy = "position";
        state.sortDir = "asc";
        renderAll();
    });

    elements.helpPoints.addEventListener("click", openHelpModal);

    elements.table.addEventListener("click", event => {
        const sortBtn = event.target.closest(".th-sort-btn");
        if (sortBtn) {
            const key = sortBtn.dataset.sort;
            if (state.sortBy === key) {
                state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
            } else {
                state.sortBy = key;
                state.sortDir = sortBtn.dataset.defaultDir || "desc";
            }
            renderTable(state.currentRanking);
            return;
        }

        const playerRow = event.target.closest(".player-row");
        if (playerRow) {
            const name = playerRow.dataset.player;
            openPlayerProfile(state.currentRanking[name], {
                onOpenMatch: matchId => {
                    const match = processedMatches.find(m => m.id === matchId);
                    openMatchModal(match);
                },
            });
        }
    });

    elements.table.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const playerRow = event.target.closest(".player-row");
        if (playerRow) {
            event.preventDefault();
            const name = playerRow.dataset.player;
            openPlayerProfile(state.currentRanking[name], {
                onOpenMatch: matchId => {
                    const match = processedMatches.find(m => m.id === matchId);
                    openMatchModal(match);
                },
            });
        }
    });
}

populateSeasons();
bindEvents();
renderAll();
