import { matches } from "../data/matches.js"
import { pointsFunc } from "./pointsFunc.js";

const results = document.querySelector("#results");

export function lastResults(){
    const filter = document.querySelector("#change-table").innerText;

    let html = "<h1>Partidas:</h1><div>";
    for (let i = matches.length-1; i >= 0; i--) {
        const match = matches[i];

        if(filter == "Tabela Padrão" && !match.x1)
            continue;
        if(filter == "Tabela de X1" && match.x1)
            continue;

        let title = "";

        if(match.x1){
            title = `X1 ${match.ranking[0].player1}/${match.ranking[1].player1} (${match.date})`
        }
        else{
            title = `${match.location} (${match.date})`
        }

        match.title = title;

        html += `
        <button value="${match.id}">
            <h2>${title}</h2>
            <p>Vencedor: <b>${match.winner}</b></p>
        </button>
        `;
        
    }
    html += "</div>"
    results.innerHTML = html;

    events();
}

function events(){
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
                            <td>${Math.round(e.troops)}</td>
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
}