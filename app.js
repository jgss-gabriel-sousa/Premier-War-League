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