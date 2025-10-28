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

/*
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
});*/

document.querySelector("#help-points").addEventListener("click", e => {
    let html = `
        <p>A pontuação do ranking é determinada pelo <strong>Aproveitamento</strong> total do jogador em todas as partidas disputadas.</p>
        <p><strong>PO</strong> = Pontos Obtidos<br>
        <p><strong>PMax</strong> = Pontos Máximos possíveis nas partidas jogadas</p>
        <h4>Aproveitamento = (PO / PMax) × 100%</h4>
        <p>O resultado é arredondado. Em caso de empate, os critérios de desempate são aplicados na seguinte ordem: <strong>Vitórias</strong> e depois <strong>Pódios</strong>.</p>
        <br>
        <p>Jogadores novos podem ter resultados distorcidos no início. Para garantir justiça, a posição definitiva no ranking só é calculada após a participação em pelo menos <strong>3 partidas</strong>.</p>
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