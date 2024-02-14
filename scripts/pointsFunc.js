export function pointsFunc(position, totalOfPlayers, playersInTeam, inTeamType){
    let points;
    position--;
    
    if(totalOfPlayers == 6){
        points = [10,8,6,3,2,1];
    }
    else if(totalOfPlayers == 5){
        points = [8,6,3,2,1];
    }
    else if(totalOfPlayers == 4){
        points = [6,3,2,1];
    }
    else if(totalOfPlayers == 3){
        points = [4,2,1];
    }
    else if(totalOfPlayers == 2){
        points = [2,-2];
    }

    if(inTeamType){
        if(inTeamType == "3 Duplas"){
            points = [5,3,1];
        }
        if(inTeamType == "2 Duplas"){
            points = [3,1];
        }
        if(inTeamType == "2 Trios"){
            points = [3,1];
        }

        return points[position];
    }

    return points[position];
}

function calcProb(eloA, eloB) {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

function updateElo(eloA, eloB, result){
    const k = 4;
  
    const probA = calcProb(eloA, eloB);
    const probB = 1 - probA;
  
    const newEloA = eloA + k * (result - probA);
    const newEloB = eloB + k * ((1 - result) - probB);
  
    return [newEloA, newEloB];
}
const elo = {};
export function eloFunc(match){
    match.ranking.forEach(p => {
        if(!elo.hasOwnProperty(p.player1)){
            elo[p.player1] = 1;
        }
        if(p.hasOwnProperty("player2") && !elo.hasOwnProperty(p.player2)){
            elo[p.player2] = 1;
        }
        if(p.hasOwnProperty("player3") && !elo.hasOwnProperty(p.player3)){
            elo[p.player3] = 1;
        }
    });

    const mRank = match.ranking;
    for(let i = 0; i < mRank.length-1; i++) {
        const winnerP1 = mRank[i].player1;
        const winnerP2 = mRank[i].player2;
        const winnerP3 = mRank[i].player3;
        let inSameTeamWinner = 1;
        if(winnerP2)    inSameTeamWinner = 2;
        if(winnerP3)    inSameTeamWinner = 3;

        for (let j = i+1; j < mRank.length; j++) {
            let winnerElo = elo[winnerP1];
            if(winnerP2)    winnerElo += elo[winnerP2];
            if(winnerP3)    winnerElo += elo[winnerP3];
            winnerElo /= inSameTeamWinner;

            //##################################
            
            const looserP1 = mRank[j].player1;
            const looserP2 = mRank[j].player2;
            const looserP3 = mRank[j].player3;
            let inSameTeamLooser = 1;
            if(looserP2)    inSameTeamLooser = 2;
            if(looserP3)    inSameTeamLooser = 3;
            let looserElo = elo[looserP1];
            if(looserP2)    looserElo += elo[looserP2];
            if(looserP3)    looserElo += elo[looserP3];
            looserElo /= inSameTeamLooser;
            
            //##################################

            let result = updateElo(winnerElo, looserElo, 1);

            elo[winnerP1] = Math.round(result[0]);
            if(winnerP2)
                elo[winnerP2] = Math.round(result[0]);
            if(winnerP3)
                elo[winnerP3] = Math.round(result[0]);
        }
    }

    return elo;
}

export function eloUpdate(ranking){
    for(const player in elo){
        ranking[player].elo = elo[player];
    }
}


export function pointsRank(player){
    const pts = player.pts;
    const ptsPercentage = player.pointsPercentage;
    const wins = player.victories;
    const podiums = player.podiums;
    const matches = player.matches;

    const pts_weight = 1;
    const ptsPercentage_weight = 1;
    const wins_weight = 5;
    const podiums_weight = 2;
    const matches_weight = 1;

    const sumOfweights = pts_weight+ptsPercentage_weight+wins_weight+podiums_weight+matches_weight;

    return Math.round((
        (pts*pts_weight)+
        (ptsPercentage*ptsPercentage_weight)+
        (wins*wins_weight)+
        (podiums*podiums_weight)+
        (matches*matches_weight))
    /sumOfweights);
}