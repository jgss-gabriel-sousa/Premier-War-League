export const MIN_MATCHES_TO_QUALIFY = 3;

function comparePlayers(a, b) {
    const aQualified = a.matches >= MIN_MATCHES_TO_QUALIFY;
    const bQualified = b.matches >= MIN_MATCHES_TO_QUALIFY;

    if (aQualified !== bQualified) {
        return aQualified ? -1 : 1;
    }

    if (aQualified && bQualified) {
        const pctDiff = b.roundedPercentage - a.roundedPercentage;
        if (pctDiff !== 0) return pctDiff;
    }

    const victoriesDiff = b.victories - a.victories;
    if (victoriesDiff !== 0) return victoriesDiff;

    const podiumsDiff = (b.podiums ?? 0) - (a.podiums ?? 0);
    if (podiumsDiff !== 0) return podiumsDiff;

    const matchesDiff = b.matches - a.matches;
    if (matchesDiff !== 0) return matchesDiff;

    return a.name.localeCompare(b.name, "pt-BR");
}

function isSameRankTier(a, b) {
    const aQualified = a.matches >= MIN_MATCHES_TO_QUALIFY;
    const bQualified = b.matches >= MIN_MATCHES_TO_QUALIFY;
    if (aQualified !== bQualified) return false;
    if (!aQualified) {
        return a.victories === b.victories && a.podiums === b.podiums;
    }
    return (
        a.roundedPercentage === b.roundedPercentage &&
        a.victories === b.victories &&
        a.podiums === b.podiums
    );
}

/**
 * Ordena o ranking e atribui posições (com tratamento correto de empates).
 * Retorna um novo objeto ordenado (não muta o objeto original).
 * @param {Record<string, object>} baseRanking
 * @returns {Record<string, object>}
 */
export function orderRanking(baseRanking) {
    const entries = Object.values(baseRanking).map(player => ({ ...player }));

    entries.sort(comparePlayers);

    const ordered = {};
    let currentPosition = 1;

    entries.forEach((player, index) => {
        if (index > 0 && !isSameRankTier(player, entries[index - 1])) {
            currentPosition = index + 1;
        }
        ordered[player.name] = {
            ...player,
            position: currentPosition,
        };
    });

    return ordered;
}

/**
 * Ordena a lista de jogadores já ranqueados por uma coluna específica da tabela.
 */
export function sortRankingList(rankingObj, sortBy = "position", direction = "asc") {
    const list = Object.values(rankingObj);
    const factor = direction === "asc" ? 1 : -1;

    return list.sort((a, b) => {
        let diff = 0;
        switch (sortBy) {
            case "position":
                diff = a.position - b.position;
                break;
            case "name":
                diff = a.name.localeCompare(b.name, "pt-BR");
                break;
            case "pointsPercentage": {
                const aVal = a.qualified ? a.roundedPercentage : -1;
                const bVal = b.qualified ? b.roundedPercentage : -1;
                diff = aVal - bVal;
                break;
            }
            case "victories":
                diff = a.victories - b.victories;
                break;
            case "podiums":
                diff = a.podiums - b.podiums;
                break;
            case "matches":
                diff = a.matches - b.matches;
                break;
            default:
                diff = a.position - b.position;
        }

        if (diff !== 0) return diff * factor;
        return a.position - b.position;
    });
}
