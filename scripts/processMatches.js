import { matches as rawMatches } from "../data/matches.js";
import { BANNED_PLAYERS } from "../data/players.js";

function parseIsoDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return {
        timestamp: date.getTime(),
        season: String(year),
        displayDate: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
    };
}

function detectTeamConfig(rankingEntries) {
    const teamSizes = rankingEntries.map(entry => entry.players.length);
    const allPairs = teamSizes.every(size => size === 2);
    const allTrios = teamSizes.every(size => size === 3);

    if (allPairs && rankingEntries.length >= 2 && rankingEntries.length <= 4) {
        return {
            inTeam: true,
            inTeamType: `${rankingEntries.length} Duplas`,
            numberOfPlayers: rankingEntries.length * 2,
        };
    }

    if (allTrios && rankingEntries.length === 2) {
        return {
            inTeam: true,
            inTeamType: "2 Trios",
            numberOfPlayers: 6,
        };
    }

    return {
        inTeam: false,
        inTeamType: null,
        numberOfPlayers: rankingEntries.length,
    };
}

function isTie(current, previous) {
    if (current.winner || previous.winner) return false;
    if (current.eliminationOrder !== undefined || previous.eliminationOrder !== undefined) {
        return current.eliminationOrder === previous.eliminationOrder;
    }
    return current.territories === previous.territories && current.troops === previous.troops;
}

/**
 * Processa a lista de partidas de forma pura (sem mutar o array original).
 * @param {Array} sourceMatches
 * @returns {Array}
 */
export function processMatches(sourceMatches = rawMatches) {
    const withTimestamps = sourceMatches.map((match, originalIndex) => {
        const { timestamp, season, displayDate } = parseIsoDate(match.date);
        return { match, originalIndex, timestamp, season, displayDate };
    });

    // Garante ordem cronológica estável (mantendo a ordem original para partidas no mesmo dia)
    withTimestamps.sort((a, b) => a.timestamp - b.timestamp || a.originalIndex - b.originalIndex);

    return withTimestamps.map(({ match, timestamp, season, displayDate }, id) => {
        const teamConfig = detectTeamConfig(match.ranking);

        let winnerLabel = "";
        let nextPosition = 1;

        const ranking = match.ranking.map((entry, index) => {
            let position;
            if (index === 0) {
                position = 1;
            } else if (isTie(entry, match.ranking[index - 1])) {
                position = nextPosition - 1;
            } else {
                position = index + 1;
            }
            nextPosition = position + 1;

            const isWinner = Boolean(entry.winner);
            if (isWinner) {
                winnerLabel = entry.players
                    .filter(p => !BANNED_PLAYERS.includes(p.name))
                    .map(p => p.name)
                    .join(" & ");
            }

            return {
                ...entry,
                players: entry.players.map(p => ({ ...p })),
                winner: isWinner,
                position,
            };
        });

        const title = `${match.location} (${displayDate})`;

        return {
            id,
            date: match.date,
            displayDate,
            season,
            timestamp,
            img: match.img ?? null,
            victory: match.victory,
            location: match.location,
            inTeam: teamConfig.inTeam,
            inTeamType: teamConfig.inTeamType,
            numberOfPlayers: teamConfig.numberOfPlayers,
            winner: winnerLabel,
            title,
            ranking,
        };
    });
}
