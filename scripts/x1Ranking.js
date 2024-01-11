import { matches } from "../data/matches.js"
import { orderRanking } from "../scripts/orderRanking.js"
import { profiles } from "./profiles.js";
import { ranking } from "./ranking.js";

let x1Ranking = {};

export function processX1Ranking(){
    const x1Matches = [];

    for(let i = 0; i < matches.length; i++){
        const match = matches[i];
        
        if(match.x1){
            match.id = i;
            x1Matches.push(match);
        }
    }

    x1Matches.forEach(match => {
        const winner = match.ranking[0];
        const looser = match.ranking[1];

        if(!x1Ranking.hasOwnProperty(winner.player1)){
            x1Ranking[winner.player1] = {
                name: winner.player1,
                victories: 0,
                matches: 0,
                elo: 100,
            };
        }
        if(!x1Ranking.hasOwnProperty(looser.player1)){
            x1Ranking[looser.player1] = {
                name: looser.player1,
                victories: 0,
                matches: 0,
                elo: 100,
            };
        }

        x1Ranking[winner.player1].victories++;
        x1Ranking[winner.player1].matches++;
        const oldWinnerElo = x1Ranking[winner.player1].elo;
        const winnerEloGain = x1Ranking[looser.player1].elo/2;
        matches[match.id].ranking[0].eloPtsGain = winnerEloGain
        x1Ranking[winner.player1].elo += winnerEloGain;

        x1Ranking[looser.player1].matches++;
        const looserEloLoss = -(x1Ranking[winner.player1].elo - oldWinnerElo);
        matches[match.id].ranking[1].eloPtsGain = looserEloLoss;
        x1Ranking[looser.player1].elo += looserEloLoss;
    });
    
    x1Ranking = orderRanking(x1Ranking);
}

export function drawX1Ranking(){
    const table = document.querySelector("#main-table");

    let html = `
    <tr>
        <th>Pos</th>
        <th>Jogador</th>
        <th>Elo</th>
        <th>Win Rate</th>
    </tr>
    `;

    for(const p in x1Ranking) {
        const player = x1Ranking[p];

        html += `
        <tr id="${player.name}">`
        
        html += "<td "
        if(player.position == 1) html += `class="gold-medal">`
        else if(player.position == 2) html += `class="silver-medal">`
        else if(player.position == 3) html += `class="bronze-medal">`
        else html += `>`
        
        html += `
            ${player.position}º</td>
            <td>${player.name}</td>
            <td>${Math.round(player.elo)}</td>
            <td>${Math.round((player.victories / player.matches)*100)}%</td>
        </tr>
        `
    }

    table.innerHTML = html;
}