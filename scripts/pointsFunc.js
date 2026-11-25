export const SOLO_POINTS = {
    6: [10, 8, 6, 3, 2, 1],
    5: [8, 6, 3, 2, 1],
    4: [6, 3, 2, 1],
    3: [4, 2, 1],
    2: [2, -2],
};

export const TEAM_POINTS = {
    "2 Duplas": [3, 1],
    "3 Duplas": [5, 3, 1],
    "4 Duplas": [6, 3, 2, 1],
    "2 Trios": [3, 1],
};

/**
 * Retorna os pontos obtidos para uma determinada posição em uma partida.
 * @param {number} position - Posição final (1-indexada)
 * @param {number} totalOfPlayers - Total de entradas/jogadores solo
 * @param {string|null} inTeamType - Tipo de equipe ("2 Duplas", "3 Duplas", "4 Duplas", "2 Trios") ou null
 * @returns {number}
 */
export function pointsFunc(position, totalOfPlayers, inTeamType = null) {
    const index = position - 1;
    if (index < 0) return 0;

    if (inTeamType && TEAM_POINTS[inTeamType]) {
        return TEAM_POINTS[inTeamType][index] ?? 0;
    }

    const table = SOLO_POINTS[totalOfPlayers];
    if (!table) return 0;
    return table[index] ?? 0;
}
