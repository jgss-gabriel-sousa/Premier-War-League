import { matches } from "../data/matches.js"

const results = document.querySelector("#results");

export function lastResults(){
    matches.sort((a,b) => b.timestamp - a.timestamp);

    let html = "<h1>Partidas:</h1><div>";
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];

        let title = "";

        if(match.x1){
            title = `X1 ${match.ranking[0].player1}/${match.ranking[1].player1} (${match.date})`
        }
        else{
            title = `${match.location} (${match.date})`
        }

        match.title = title;

        html += `
        <button value="${matches.length-i-1}">
            <h1>${title}</h1>
            <p>Vencedor: <b>${match.winner}</b></p>
        </button>
        `;
        
    }
    html += "</div>"
    results.innerHTML = html;
}