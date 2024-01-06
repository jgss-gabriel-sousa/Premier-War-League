import { matches } from "../data/matches.js"
import { orderRanking } from "./orderRanking.js";
import { pointsFunc } from "./pointsFunc.js";
import { profiles } from "./profiles.js";

export function ranking(){
    let ranking = {};
    
    matches.forEach(match => {
        const mRank = match.ranking;
        let nmbrOfPlayers = match.numberOfPlayers;

        if(match.x1)
            return;

        for(let i = 0; i < mRank.length; i++){
            const p = mRank[i];
            let playersInTeam = 1;

            if(p.hasOwnProperty("player2")) playersInTeam = 2;
            if(p.hasOwnProperty("player3")) playersInTeam = 3;

            if(!ranking.hasOwnProperty(p.player1)){
                ranking[p.player1] = {
                    name: p.player1,
                    pts: 0,
                    max_pts: 0,
                    victories: 0,
                    podiums: 0,
                    x1s: 0,
                    matches: 0,
                    positionsHistory: [],
                    colorsHistory: [],
                };
            }
            if(playersInTeam == 2 && !ranking.hasOwnProperty(p.player2)){
                if(!ranking.hasOwnProperty(p.player1)){
                    ranking[p.player1] = {
                        name: p.player1,
                        pts: 0,
                        max_pts: 0,
                        victories: 0,
                        podiums: 0,
                        x1s: 0,
                        matches: 0,
                        positionsHistory: [],
                        colorsHistory: [],
                    };
                }
                if(!ranking.hasOwnProperty(p.player2)){
                    ranking[p.player2] = {
                        name: p.player2,
                        pts: 0,
                        max_pts: 0,
                        victories: 0,
                        podiums: 0,
                        x1s: 0,
                        matches: 0,
                        positionsHistory: [],
                        colorsHistory: [],
                    };
                }
            }
            if(playersInTeam == 3){
                if(!ranking.hasOwnProperty(p.player2)){
                    ranking[p.player2] = {
                        name: p.player2,
                        pts: 0,
                        max_pts: 0,
                        victories: 0,
                        podiums: 0,
                        x1s: 0,
                        matches: 0,
                        positionsHistory: [],
                        colorsHistory: [],
                    };
                }
                if(!ranking.hasOwnProperty(p.player3)){
                    ranking[p.player3] = {
                        name: p.player3,
                        pts: 0,
                        max_pts: 0,
                        victories: 0,
                        podiums: 0,
                        x1s: 0,
                        matches: 0,
                        positionsHistory: [],
                        colorsHistory: [],
                    };
                }
            }

            if(match.x1){
                if(match.ranking[i].position == 1){
                    ranking[p.player1].pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers);
                }
                else{
                    ranking[p.player1].pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers);
                }

                ranking[p.player1].x1s++;
            }

            if(!match.x1 && playersInTeam == 1){
                ranking[p.player1].pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers);
                ranking[p.player1].max_pts += pointsFunc(1, nmbrOfPlayers);
                ranking[p.player1].matches++;
                ranking[p.player1].positionsHistory.push(match.ranking[i].position);
                ranking[p.player1].colorsHistory.push(match.ranking[i].color);
            }
            if(playersInTeam == 2){
                ranking[p.player1].pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player1].max_pts += pointsFunc(1, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].max_pts += pointsFunc(1, nmbrOfPlayers, playersInTeam);
                ranking[p.player1].matches++;
                ranking[p.player2].matches++;
                ranking[p.player1].positionsHistory.push(match.ranking[i].position);
                ranking[p.player2].positionsHistory.push(match.ranking[i].position);
                
                let colorP1;
                let colorP2;
                if(match.ranking[i].color.includes("-")){
                    colorP1 = match.ranking[i].color.split("-")[0];
                    colorP2 = match.ranking[i].color.split("-")[1];
                }
                else{
                    colorP1 = match.ranking[i].color;
                    colorP2 = match.ranking[i].color;
                }
                ranking[p.player1].colorsHistory.push(colorP1);
                ranking[p.player2].colorsHistory.push(colorP2);
            }
            if(playersInTeam == 3){
                ranking[p.player1].pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player3].pts += pointsFunc(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player1].max_pts += pointsFunc(1, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].max_pts += pointsFunc(1, nmbrOfPlayers, playersInTeam);
                ranking[p.player3].max_pts += pointsFunc(1, nmbrOfPlayers, playersInTeam);
                ranking[p.player1].matches++;
                ranking[p.player2].matches++;
                ranking[p.player3].matches++;
                ranking[p.player1].positionsHistory.push(match.ranking[i].position);
                ranking[p.player2].positionsHistory.push(match.ranking[i].position);
                ranking[p.player3].positionsHistory.push(match.ranking[i].position);
                
                let colorP1;
                let colorP2;
                let colorP3;
                if(match.ranking[i].color.includes("-")){
                    colorP1 = match.ranking[i].color.split("-")[0];
                    colorP2 = match.ranking[i].color.split("-")[1];
                    colorP3 = match.ranking[i].color.split("-")[2];
                }
                else{
                    colorP1 = match.ranking[i].color;
                    colorP2 = match.ranking[i].color;
                    colorP3 = match.ranking[i].color;
                }
                ranking[p.player1].colorsHistory.push(colorP1);
                ranking[p.player2].colorsHistory.push(colorP2);
                ranking[p.player3].colorsHistory.push(colorP3);
            }
            
            if(match.ranking[i].position == 1 && !match.x1){
                ranking[p.player1].victories++;

                if(playersInTeam == 2) ranking[p.player2].victories++;
                if(playersInTeam == 3){
                    ranking[p.player2].victories++;
                    ranking[p.player3].victories++;
                }
            }

            if(match.ranking[i].position <= 3 && !match.x1 && !match.inTeam){
                ranking[p.player1].podiums++;
                if(playersInTeam == 2) ranking[p.player2].podiums++;
                if(playersInTeam == 3){
                    ranking[p.player2].podiums++;
                    ranking[p.player3].podiums++;
                }
            }
        }
    });

    return ranking;
}

export function drawRanking(finalRanking){
    const table = document.querySelector("#main-table");

    let html = `
    <tr>
        <th>Pos</th>
        <th>Jogador</th>
        <th>Pontos</th>
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
            <td>${e.pts}</td>
            <td>${e.victories}</td>
            <td>${e.podiums}</td>
            <td>${e.matches}</td>
        </tr>
        `;
    }
    table.innerHTML = html;

    profiles(finalRanking);
}