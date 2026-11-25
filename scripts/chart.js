import { escapeHtml } from "./ui.js";

const LINE_COLORS = [
    "#37003c",
    "#00a86b",
    "#e11d48",
    "#2563eb",
    "#d97706",
    "#7c3aed",
    "#0891b2",
    "#65a30d",
    "#db2777",
];

/**
 * Renderiza um gráfico SVG interativo da evolução do aproveitamento (%) ao longo das partidas.
 */
export function renderEvolutionChart(container, rankingHistory, currentRanking) {
    if (!container) return;

    const qualifiedPlayers = Object.values(currentRanking)
        .filter(p => p.qualified)
        .sort((a, b) => a.position - b.position);

    if (rankingHistory.length < 2 || qualifiedPlayers.length === 0) {
        container.innerHTML = `
            <div class="chart-empty">
                <p>Jogue pelo menos 2 partidas na temporada selecionada para visualizar a evolução do aproveitamento.</p>
            </div>
        `;
        return;
    }

    const activePlayers = new Set(qualifiedPlayers.slice(0, 6).map(p => p.name));
    const colorMap = new Map();
    qualifiedPlayers.forEach((p, idx) => {
        colorMap.set(p.name, LINE_COLORS[idx % LINE_COLORS.length]);
    });

    function draw() {
        const width = 760;
        const height = 280;
        const pad = { top: 20, right: 24, bottom: 44, left: 44 };
        const plotW = width - pad.left - pad.right;
        const plotH = height - pad.top - pad.bottom;

        const xCount = rankingHistory.length;
        const xScale = idx => pad.left + (xCount > 1 ? (idx / (xCount - 1)) * plotW : plotW / 2);
        const yScale = pct => pad.top + plotH - (Math.max(0, Math.min(100, pct)) / 100) * plotH;

        const yTicks = [0, 25, 50, 75, 100];
        const gridLines = yTicks
            .map(tick => {
                const y = yScale(tick);
                return `
                    <line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" class="chart-grid" />
                    <text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" class="chart-axis-label">${tick}%</text>
                `;
            })
            .join("");

        const xLabelStep = Math.max(1, Math.ceil(xCount / 5));
        let lastLabelX = -Infinity;
        const xLabels = rankingHistory
            .map((snap, idx) => {
                const x = xScale(idx);
                const isLast = idx === xCount - 1;
                const isRegular = idx === 0 || idx % xLabelStep === 0;
                if (!isLast && !isRegular) return "";
                if (!isLast && xScale(xCount - 1) - x < 68) return "";
                if (x - lastLabelX < 62) return "";
                lastLabelX = x;
                const shortDate = snap.displayDate.slice(0, 5) + "/" + snap.displayDate.slice(8);
                return `<text x="${x}" y="${height - 12}" text-anchor="middle" class="chart-axis-label">${escapeHtml(shortDate)}</text>`;
            })
            .join("");

        const seriesSvg = qualifiedPlayers
            .filter(p => activePlayers.has(p.name))
            .map(player => {
                const color = colorMap.get(player.name);
                const points = [];

                rankingHistory.forEach((snap, idx) => {
                    const entry = snap.rank[player.name];
                    if (entry && entry.matches > 0) {
                        points.push({
                            x: xScale(idx),
                            y: yScale(entry.roundedPercentage),
                            pct: entry.roundedPercentage,
                            pos: entry.position,
                            date: snap.displayDate,
                        });
                    }
                });

                if (points.length === 0) return "";

                const pathD = points
                    .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
                    .join(" ");

                const dots = points
                    .map(
                        pt => `
                        <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4" fill="${color}" class="chart-dot">
                            <title>${escapeHtml(player.name)} • ${pt.date}: ${pt.pct}% (${pt.pos}º lugar)</title>
                        </circle>`
                    )
                    .join("");

                return `
                    <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
                    ${dots}
                `;
            })
            .join("");

        const chipsHtml = qualifiedPlayers
            .map(player => {
                const color = colorMap.get(player.name);
                const isActive = activePlayers.has(player.name);
                return `
                    <button type="button"
                        class="chart-chip ${isActive ? "is-active" : ""}"
                        data-player="${escapeHtml(player.name)}"
                        aria-pressed="${isActive}"
                        style="--chip-color: ${color}">
                        <span class="chart-chip-dot" aria-hidden="true"></span>
                        ${escapeHtml(player.name)}
                    </button>
                `;
            })
            .join("");

        container.innerHTML = `
            <div class="chart-chips" role="group" aria-label="Filtrar jogadores no gráfico">
                ${chipsHtml}
            </div>
            <div class="chart-svg-wrap">
                <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="Gráfico de evolução do aproveitamento dos jogadores">
                    ${gridLines}
                    ${xLabels}
                    ${seriesSvg}
                </svg>
            </div>
        `;

        container.querySelectorAll(".chart-chip").forEach(btn => {
            btn.addEventListener("click", () => {
                const name = btn.dataset.player;
                if (activePlayers.has(name)) {
                    if (activePlayers.size > 1) activePlayers.delete(name);
                } else {
                    activePlayers.add(name);
                }
                draw();
            });
        });
    }

    draw();
}
