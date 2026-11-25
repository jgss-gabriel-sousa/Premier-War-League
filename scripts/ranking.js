import { BANNED_PLAYERS } from "../data/players.js";
import { MIN_MATCHES_TO_QUALIFY, orderRanking } from "./orderRanking.js";
import { pointsFunc } from "./pointsFunc.js";

const DAY_MS = 1000 * 60 * 60 * 24;

function createBasePlayer(name) {
    return {
        name,
        pts: 0,
        maxPts: 0,
        pointsPercentage: 0,
        roundedPercentage: 0,
        qualified: false,
        victories: 0,
        podiums: 0,
        matches: 0,
        positionsHistory: [],
        colorsHistory: [],
        recentForm: [], // "W" | "P" | "L"
        matchLog: [],
        totalTerritories: 0,
        totalTroops: 0,
        teammates: {},
        headToHead: {}, // { [opponent]: { wins: number, losses: number, ties: number } }
        currentWinStreak: 0,
        bestWinStreak: 0,
        leaderTime: 0,
        isActualLeader: false,
    };
}

function snapshotForHistory(ranking) {
    const snap = {};
    for (const [name, p] of Object.entries(ranking)) {
        snap[name] = {
            name: p.name,
            pts: p.pts,
            maxPts: p.maxPts,
            pointsPercentage: p.pointsPercentage,
            roundedPercentage: p.roundedPercentage,
            qualified: p.qualified,
            victories: p.victories,
            podiums: p.podiums,
            matches: p.matches,
        };
    }
    return snap;
}

function computeLeaderTime(rankingHistory, nowTimestamp = Date.now()) {
    const leaderMs = {};
    let currentLeaders = [];
    let lastTimestamp = null;

    for (const snapshot of rankingHistory) {
        if (lastTimestamp !== null && currentLeaders.length > 0) {
            const delta = Math.max(0, snapshot.time - lastTimestamp);
            for (const leaderName of currentLeaders) {
                leaderMs[leaderName] = (leaderMs[leaderName] ?? 0) + delta;
            }
        }

        const ordered = orderRanking(snapshot.rank, "standard");
        const qualifiedPlayers = Object.values(ordered).filter(p => p.qualified);
        const pool = qualifiedPlayers.length > 0 ? qualifiedPlayers : Object.values(ordered);
        const topPosition = pool.length > 0 ? Math.min(...pool.map(p => p.position)) : null;

        currentLeaders = topPosition !== null
            ? pool.filter(p => p.position === topPosition).map(p => p.name)
            : [];

        lastTimestamp = snapshot.time;
    }

    if (lastTimestamp !== null && currentLeaders.length > 0 && nowTimestamp > lastTimestamp) {
        const delta = nowTimestamp - lastTimestamp;
        for (const leaderName of currentLeaders) {
            leaderMs[leaderName] = (leaderMs[leaderName] ?? 0) + delta;
        }
    }

    const leaderDays = {};
    for (const [name, ms] of Object.entries(leaderMs)) {
        leaderDays[name] = Math.round(ms / DAY_MS);
    }

    return { leaderDays, currentLeaders };
}

/**
 * Calcula o ranking geral e o histórico de evolução.
 * @param {Array} processedMatches
 * @param {{ season?: string, nowTimestamp?: number }} options
 */
export function computeRanking(processedMatches, { season = "all", nowTimestamp = Date.now() } = {}) {
    const ranking = {};
    const rankingHistory = [];

    const filteredMatches = processedMatches.filter(match => {
        if (season !== "all" && match.season !== season) return false;
        return true;
    });

    for (const match of filteredMatches) {
        const entryPointsMap = new Map();

        for (const entry of match.ranking) {
            const gainedPts = pointsFunc(entry.position, match.numberOfPlayers, match.inTeamType);
            const maxMatchPts = pointsFunc(1, match.numberOfPlayers, match.inTeamType);
            const isWin = entry.position === 1;
            const isPodium = entry.position <= 3 && !match.inTeam && match.ranking.length >= 3;

            const activePlayers = entry.players.filter(p => !BANNED_PLAYERS.includes(p.name));

            for (const pInfo of activePlayers) {
                if (!ranking[pInfo.name]) {
                    ranking[pInfo.name] = createBasePlayer(pInfo.name);
                }

                const player = ranking[pInfo.name];
                player.pts += gainedPts;
                player.maxPts += maxMatchPts;
                player.pointsPercentage = player.maxPts > 0 ? (player.pts / player.maxPts) * 100 : 0;
                player.roundedPercentage = Math.round(player.pointsPercentage);
                player.matches += 1;
                player.qualified = player.matches >= MIN_MATCHES_TO_QUALIFY;
                player.positionsHistory.push(entry.position);
                player.colorsHistory.push(pInfo.color);
                player.totalTerritories += entry.territories;
                player.totalTroops += Math.round(entry.troops);

                if (isWin) {
                    player.victories += 1;
                    player.currentWinStreak += 1;
                    if (player.currentWinStreak > player.bestWinStreak) {
                        player.bestWinStreak = player.currentWinStreak;
                    }
                } else {
                    player.currentWinStreak = 0;
                }

                if (isPodium) {
                    player.podiums += 1;
                }

                const formCode = isWin ? "W" : isPodium ? "P" : "L";
                player.recentForm.push(formCode);

                player.matchLog.push({
                    matchId: match.id,
                    title: match.title,
                    date: match.displayDate,
                    position: entry.position,
                    points: gainedPts,
                    maxPoints: maxMatchPts,
                    color: pInfo.color,
                    territories: entry.territories,
                    troops: Math.round(entry.troops),
                    inTeam: match.inTeam,
                    inTeamType: match.inTeamType,
                });

                // Parceiros de equipe
                if (activePlayers.length > 1) {
                    for (const mate of activePlayers) {
                        if (mate.name !== pInfo.name) {
                            player.teammates[mate.name] = (player.teammates[mate.name] ?? 0) + 1;
                        }
                    }
                }

                entryPointsMap.set(pInfo.name, entry.position);
            }
        }

        // Confronto direto (Head-to-Head) entre jogadores em entradas distintas
        for (let i = 0; i < match.ranking.length; i++) {
            const entryA = match.ranking[i];
            const playersA = entryA.players.filter(p => !BANNED_PLAYERS.includes(p.name));

            for (let j = i + 1; j < match.ranking.length; j++) {
                const entryB = match.ranking[j];
                const playersB = entryB.players.filter(p => !BANNED_PLAYERS.includes(p.name));

                for (const pA of playersA) {
                    for (const pB of playersB) {
                        const h2hA = ranking[pA.name].headToHead[pB.name] ?? { wins: 0, losses: 0, ties: 0 };
                        const h2hB = ranking[pB.name].headToHead[pA.name] ?? { wins: 0, losses: 0, ties: 0 };

                        if (entryA.position < entryB.position) {
                            h2hA.wins += 1;
                            h2hB.losses += 1;
                        } else if (entryA.position > entryB.position) {
                            h2hA.losses += 1;
                            h2hB.wins += 1;
                        } else {
                            h2hA.ties += 1;
                            h2hB.ties += 1;
                        }

                        ranking[pA.name].headToHead[pB.name] = h2hA;
                        ranking[pB.name].headToHead[pA.name] = h2hB;
                    }
                }
            }
        }

        const snapRank = snapshotForHistory(ranking);
        const orderedSnap = orderRanking(snapRank, "standard");

        rankingHistory.push({
            matchId: match.id,
            date: match.date,
            displayDate: match.displayDate,
            time: match.timestamp,
            rank: orderedSnap,
        });
    }

    // Só calcula leaderTime para o ranking geral completo (todas as temporadas)
    if (season === "all") {
        const { leaderDays, currentLeaders } = computeLeaderTime(rankingHistory, nowTimestamp);
        for (const [name, days] of Object.entries(leaderDays)) {
            if (ranking[name]) {
                ranking[name].leaderTime = days;
                ranking[name].isActualLeader = currentLeaders.includes(name);
            }
        }
    }

    const orderedRanking = orderRanking(ranking, "standard");

    return {
        ranking: orderedRanking,
        rankingHistory,
        matchCount: filteredMatches.length,
    };
}
