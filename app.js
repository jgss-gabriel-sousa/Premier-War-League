import { matches } from "./data/matches.js"
import { lastResults } from "./scripts/lastResults.js";
import { orderRanking } from "./scripts/orderRanking.js";
import { eloFunc, pointsFunc } from "./scripts/pointsFunc.js"
import { processLeaderTime } from "./scripts/processLeaderTime.js";
import { processMatches } from "./scripts/processMatches.js";
import { drawRanking, ranking } from "./scripts/ranking.js";
import { drawX1Ranking, processX1Ranking } from "./scripts/x1Ranking.js";

let finalRanking = {};

processMatches();
lastResults();

finalRanking = ranking();
finalRanking = orderRanking(finalRanking);
drawRanking(finalRanking);

processLeaderTime();
processX1Ranking();

const changeTable = document.querySelector("#change-table");
changeTable.addEventListener("click", e => {
    if(changeTable.innerText == "Tabela de X1"){
        drawX1Ranking();
        changeTable.innerText = "Tabela Padrão"
    }
    else{
        drawRanking(finalRanking);
        changeTable.innerText = "Tabela de X1"
    }

    lastResults();
});

const buttons = document.querySelectorAll("#results button");
buttons.forEach(el => {
    el.addEventListener("click", e => {
        const match = matches[el.value];

        let html = `
        <a target="_blank" href="./data/img/matches/${match.img}.webp"><img class="profile-photo" src="./data/img/matches/${match.img}.webp"/></a>
        <p>Vitória por: ${match.victory}</p>
        <table id="match-result">
        <tr>
            <th>Pos</th>
            <th>Jogador</th>
            <th>Cor</th>
            <th>Pontos</th>
            <th>Territórios</th>
            <th>Tropas</th>
        </tr>
        `; 

        for (let i = 0; i < match.ranking.length; i++) {
            const e = match.ranking[i];

            let players = "";

            let playersInSameTeam = 1;

            if(e.player2) playersInSameTeam = 2;
            if(e.player3) playersInSameTeam = 3;

            for(let p = 0; p < playersInSameTeam; p++) {
                if(p > 0){
                    html += `<tr`
                    if(e.position == 1){
                        html += ` class="match-result-winner" `;
                    }
                    html += `><td></td>`
                        
                    if(p == 1)
                        html += `<td>${e.player2}</td>`
                    if(p == 2)
                        html += `<td>${e.player3}</td>`
                    
                    let color;
                    if(!e.color.split("-")[p]){
                        color = e.color.split("-")[0];
                    }
                    else{
                        color = e.color.split("-")[p];
                    }

                    html += `
                        <td>${color}</td>
                        <td>${pointsFunc(e.position, match.numberOfPlayers, playersInSameTeam, match.inTeamType)}</td>
                        <td></td>
                        <td></td>
                    </tr>
                    `;
                }
                else{
                    html += `<tr`
                    if(e.position == 1){
                        html += ` class="match-result-winner" `;
                    }

                    html += `
                    >
                        <td>${e.position}º</td>
                        <td>${e.player1}</td>
                        <td>${e.color.split("-")[0]}</td>`
                        
                    if(!match.x1){
                        html += `<td>${pointsFunc(e.position, match.numberOfPlayers, playersInSameTeam, match.inTeamType)}</td>`
                    }
                    else{
                        html += `<td>${e.eloPtsGain}</td>`
                    }
                        
                    html += `
                        <td>${e.territories}</td>
                        <td>${e.troops}</td>
                    </tr>
                    `;
                }
            }
        }
        html += "</table>"

        Swal.fire({
            title: match.title,
            html: html,
            width: "600px",
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
            focusConfirm: false,
        });
    });
});


document.querySelector("#help-points").addEventListener("click", e => {
    let html = `
        <p>A pontuação principal do ranking é composta pelo Aproveitamento somado de todas as partidas Solos e em Grupos (exclui-se os X1).</p>
        <p>PO = Pontos Obtidos</p>
        <p>PMax = Pontos Máximos combinados das partidas que o jogador jogou</p>
        <h4>Aproveitamento = (PO / PMax) * 100%</h4>
        <p>Utiliza-se um arredondamento no resultado, logo, em caso de empate, os critérios de desempate são, Vitórias e Pódios, nesta ordem.</p>
        <br>
        <p>Novos jogadores no ranking tendem a ficar com resultados bem injustos, para evitar isso, sua posição definitiva no ranking só é obtida após o resultado de pelo menos 3 partidas.</p>
    `

    Swal.fire({
        title: "",
        html: html,
        width: "600px",
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: false,
        focusConfirm: false,
    });
});