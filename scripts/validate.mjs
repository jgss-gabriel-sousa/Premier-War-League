import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { matches } from "../data/matches.js";
import { ARMY_COLORS, BANNED_PLAYERS, PLAYER_PHOTOS } from "../data/players.js";
import { orderRanking } from "./orderRanking.js";
import { pointsFunc } from "./pointsFunc.js";
import { processMatches } from "./processMatches.js";
import { computeRanking } from "./ranking.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

console.log("Validando dados e regras da Premier War League...");

// 1. Validação dos dados brutos de partidas
assert.ok(Array.isArray(matches) && matches.length > 0, "matches deve ser um array não vazio");

for (const [idx, match] of matches.entries()) {
    assert.match(match.date, /^\d{4}-\d{2}-\d{2}$/, `Partida #${idx} com data fora do padrão ISO: ${match.date}`);
    assert.ok(match.victory && match.victory.length > 0, `Partida #${idx} sem condição de vitória`);
    assert.ok(match.location && match.location.length > 0, `Partida #${idx} sem local`);
    assert.ok(Array.isArray(match.ranking) && match.ranking.length >= 2, `Partida #${idx} precisa de ao menos 2 entradas`);

    const winners = match.ranking.filter(r => r.winner);
    assert.equal(winners.length, 1, `Partida ${match.date} deve ter exatamente 1 vencedor`);

    // Verifica se a foto existe quando informada
    if (match.img) {
        const imgPath = path.join(rootDir, "data", "img", "matches", `${match.img}.webp`);
        assert.ok(fs.existsSync(imgPath), `Imagem da partida não encontrada: ${imgPath}`);
    }

    // Verifica cores válidas e ausência de cores duplicadas em partidas solo
    const seenSoloColors = new Set();
    const isSolo = match.ranking.every(entry => entry.players.length === 1);
    for (const entry of match.ranking) {
        assert.ok(Array.isArray(entry.players) && entry.players.length > 0, `Entrada sem players em ${match.date}`);
        for (const player of entry.players) {
            assert.ok(player.name && player.name.trim().length > 0, `Jogador sem nome em ${match.date}`);
            assert.ok(ARMY_COLORS[player.color], `Cor inválida "${player.color}" em ${match.date}`);
            if (isSolo) {
                assert.ok(
                    !seenSoloColors.has(player.color),
                    `Cor duplicada "${player.color}" na partida solo ${match.date}`
                );
                seenSoloColors.add(player.color);
            }
        }
    }
}

// 2. Validação das fotos de jogadores registradas em PLAYER_PHOTOS
for (const [player, files] of Object.entries(PLAYER_PHOTOS)) {
    for (const file of files) {
        const photoPath = path.join(rootDir, "data", "img", "players", file);
        assert.ok(fs.existsSync(photoPath), `Foto do jogador ${player} não encontrada: ${photoPath}`);
    }
}

// 3. Testes unitários de pontuação
assert.equal(pointsFunc(1, 6, null), 10);
assert.equal(pointsFunc(6, 6, null), 1);
assert.equal(pointsFunc(1, 8, "4 Duplas"), 6);
assert.equal(pointsFunc(4, 8, "4 Duplas"), 1);
assert.equal(pointsFunc(1, 6, "3 Duplas"), 5);
assert.equal(pointsFunc(2, 6, "2 Trios"), 1);

// 4. Testes do processamento de partidas (incluindo 4 Duplas)
const processed = processMatches(matches);
assert.equal(processed.length, matches.length);

const fourPairsMatch = processed.find(m => m.date === "2025-12-27");
assert.ok(fourPairsMatch, "Partida 2025-12-27 deve existir");
assert.equal(fourPairsMatch.inTeam, true, "Partida 2025-12-27 deve ser marcada como inTeam");
assert.equal(fourPairsMatch.inTeamType, "4 Duplas", "Partida 2025-12-27 deve ter tipo '4 Duplas'");
assert.equal(fourPairsMatch.numberOfPlayers, 8, "Partida 2025-12-27 deve ter 8 jogadores");

// 5. Teste de ordenação com 0 pódios (regressão do bug falsy)
const mockRank = {
    A: { name: "A", roundedPercentage: 50, victories: 1, podiums: 0, matches: 4 },
    B: { name: "B", roundedPercentage: 50, victories: 1, podiums: 2, matches: 4 },
    C: { name: "C", roundedPercentage: 100, victories: 2, podiums: 2, matches: 2 }, // < 3 partidas
};
const orderedMock = orderRanking(mockRank);
assert.deepEqual(Object.keys(orderedMock), ["B", "A", "C"]);
assert.equal(orderedMock.B.position, 1);
assert.equal(orderedMock.A.position, 2);
assert.equal(orderedMock.C.position, 3);

// 6. Testes do ranking geral completo e garantia de BANNED_PLAYERS ocultos
const { ranking, rankingHistory } = computeRanking(processed, {
    nowTimestamp: new Date("2026-11-24T00:00:00Z").getTime(),
});
assert.ok(Object.keys(ranking).length > 0, "Ranking geral não pode estar vazio");
for (const banned of BANNED_PLAYERS) {
    assert.equal(ranking[banned], undefined, `Jogador banido (${banned}) não deve aparecer no ranking`);
    for (const player of Object.values(ranking)) {
        assert.equal(player.headToHead[banned], undefined, `Jogador banido (${banned}) não deve aparecer em headToHead`);
        assert.equal(player.teammates[banned], undefined, `Jogador banido (${banned}) não deve aparecer em teammates`);
    }
}
assert.ok(rankingHistory.length > 0, "Histórico do ranking deve ser gerado");

console.log(`Sucesso! ${processed.length} partidas e ${Object.keys(ranking).length} jogadores validados.`);
