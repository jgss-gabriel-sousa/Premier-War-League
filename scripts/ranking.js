import { matches } from "../data/matches.js"
import { orderRanking } from "./orderRanking.js";
import { eloFunc, eloUpdate, pointsFunc, pointsRank } from "./pointsFunc.js";
import { profiles } from "./profiles.js";

export function ranking(){
    let ranking = {};
    let rankingHistory = [];
    
    const basePlayer = {
        name: "",
        pts: 0,
        max_pts: 0,
        ptsRanking: 0,
        pointsPercentage: 0,
        victories: 0,
        podiums: 0,
        x1s: 0,
        matches: 0,
        positionsHistory: [],
        colorsHistory: [],
    };

    matches.forEach(match => {
        if(match.x1)
            return;

        const mRank = match.ranking;
        let nmbrOfPlayers = match.numberOfPlayers;

        for(let i = 0; i < mRank.length; i++){
            const p = mRank[i];
            let playersInTeam = 1;
            let inTeamType = match.inTeamType;

            if(p.hasOwnProperty("player2")) playersInTeam = 2;
            if(p.hasOwnProperty("player3")) playersInTeam = 3;

            if(!ranking.hasOwnProperty(p.player1)){
                ranking[p.player1] = JSON.parse(JSON.stringify(basePlayer));
                ranking[p.player1].name = p.player1;
            }
            if(playersInTeam == 2 && !ranking.hasOwnProperty(p.player2)){
                if(!ranking.hasOwnProperty(p.player1)){
                    ranking[p.player1] = JSON.parse(JSON.stringify(basePlayer));
                    ranking[p.player1].name = p.player1;
                }
                if(!ranking.hasOwnProperty(p.player2)){
                    ranking[p.player2] = JSON.parse(JSON.stringify(basePlayer));
                    ranking[p.player2].name = p.player2;
                }
            }
            if(playersInTeam == 3){
                if(!ranking.hasOwnProperty(p.player2)){
                    ranking[p.player2] = JSON.parse(JSON.stringify(basePlayer));
                    ranking[p.player2].name = p.player2;
                }
                if(!ranking.hasOwnProperty(p.player3)){
                    ranking[p.player3] = JSON.parse(JSON.stringify(basePlayer));
                    ranking[p.player3].name = p.player3;
                }
            }

            function processPlayer(player, playerID) {
                player.pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers, playersInTeam, inTeamType);
                player.max_pts += pointsFunc(1, nmbrOfPlayers, playersInTeam, inTeamType);
                player.pointsPercentage = (player.pts / player.max_pts) * 100;
                player.ptsRanking = pointsRank(player);
                player.matches++;
                player.positionsHistory.push(match.ranking[i].position);
                
                let colorP1 = match.ranking[i].color;
                let colorP2 = match.ranking[i].color;
                let colorP3 = match.ranking[i].color;

                if(match.ranking[i].color.includes("-")){
                    colorP1 = match.ranking[i].color.split("-")[0];
                    colorP2 = match.ranking[i].color.split("-")[1];
                    colorP3 = match.ranking[i].color.split("-")[2];
                }

                if(playerID == "p1")    player.colorsHistory.push(colorP1);
                if(playerID == "p2")    player.colorsHistory.push(colorP2);
                if(playerID == "p3")    player.colorsHistory.push(colorP3);
            }


            if(playersInTeam == 1){
                processPlayer(ranking[p.player1], "p1");
            }
            if(playersInTeam == 2){
                processPlayer(ranking[p.player1], "p1");
                processPlayer(ranking[p.player2], "p2");
            }
            if(playersInTeam == 3){
                processPlayer(ranking[p.player1], "p1");
                processPlayer(ranking[p.player2], "p2");
                processPlayer(ranking[p.player3], "p3");
            }
            
    
            if(match.ranking[i].position == 1){
                ranking[p.player1].victories++;

                if(playersInTeam == 2) ranking[p.player2].victories++;
                if(playersInTeam == 3){
                    ranking[p.player2].victories++;
                    ranking[p.player3].victories++;
                }
            }

            if(match.ranking[i].position <= 3 && !match.inTeam && match.ranking.length >= 3){
                ranking[p.player1].podiums++;

                if(playersInTeam == 2) ranking[p.player2].podiums++;
                if(playersInTeam == 3){
                    ranking[p.player2].podiums++;
                    ranking[p.player3].podiums++;
                }
            }
        }

        rankingHistory.push({
            rank: JSON.parse(JSON.stringify(ranking)),
            time: match.timestamp,
            matchID: match.id,
        });

        const lastRanking = rankingHistory[rankingHistory.length-1];

        if(match.id > 2){
            for(const p in lastRanking.rank){
                const player = lastRanking.rank[p];

                if(player.matches < 3){
                    delete lastRanking.rank[p];
                }
            }
        }
    });

    for(const p in ranking) {
        const player = ranking[p];

        if(player.matches < 3){
            player.pointsPercentage = 0;
        }
        else{
            player.pointsPercentage = parseFloat(player.pointsPercentage).toFixed(0)+"%";
        }
    }

    const leader = {};
    let lastTime;
    let lastLeader;
    for(const r in rankingHistory) {
        const rank = rankingHistory[r].rank;

        if(lastTime == null) lastTime = rankingHistory[r].time;

        orderRanking(rank);

        for(const p in rank){
            const player = rank[p];

            if(player.position == 1){
                if(!leader[p]){
                    leader[p] = rankingHistory[r].time - lastTime;
                }
                else{
                    leader[p] += rankingHistory[r].time - lastTime;
                }

                if(p != lastLeader && lastLeader != null){
                    leader[lastLeader] += rankingHistory[r].time - lastTime;
                    leader[p] -= rankingHistory[r].time - lastTime;
                }

                lastLeader = p;
            }
        }
        
        lastTime = rankingHistory[r].time;
    }
    leader[lastLeader] += (Date.now() - lastTime);

    for(const p in leader) {
        ranking[p].leaderTime = Math.round(leader[p] / (1000 * 3600 * 24));
        
        if(lastLeader == p){
            ranking[p].isActualLeader = true;
        }
    }

    return ranking;
}

export function drawRanking(finalRanking){
    const table = document.querySelector("#main-table > table");

    let html = `
    <tr>
        <th>Pos</th>
        <th>Jogador</th>
        <th>Apr</th>
        <th>Vitórias</th>
        <th>Pódios</th>
        <th>Partidas</th>
    </tr>
    `;

    for (const player in finalRanking) {
        const e = finalRanking[player];

        html += `
        <tr id="${e.name}">`
        
        html += "<td "
        if(e.position == 1) html += `class="gold-medal">`
        else if(e.position == 2) html += `class="silver-medal">`
        else if(e.position == 3) html += `class="bronze-medal">`
        else html += `>`
        
        html += `
            ${e.position}º</td>
            <td>${e.name}</td>
            <td>${e.pointsPercentage == 0 ? "*" : e.pointsPercentage}</td>
            <td>${e.victories}</td>
            <td>${e.podiums}</td>
            <td>${e.matches}</td>
        </tr>
        `;
    }
    table.innerHTML = html;

    profiles(finalRanking);
}