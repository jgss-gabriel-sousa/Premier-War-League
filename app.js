import { matches } from "./data/matches.js"

const table = document.querySelector("#main-table");
const results = document.querySelector("#results");
let finalRanking = {};

function pointSystem(position, totalOfPlayers, playersInTeam){
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

    if(playersInTeam > 1){
        console.log(Math.floor(points[position] / playersInTeam))
        return Math.max((Math.floor(points[position] / playersInTeam)), 1);
    }

    return points[position];
}

function processMatches(){
    matches.forEach(match => {
        const mRank = match.ranking;
        match.numberOfPlayers = match.ranking.length;
        const mNewRank = [];
        
        let parseDate = match.date.split("-");
        let date = new Date(parseDate[2], parseDate[1] - 1, parseDate[0]);
        match.timestamp = date.getTime();
        
        if(match.ranking.length == 2 && match.ranking[0].player2 == undefined && match.ranking[1].player2 == undefined){
            match.x1 = true;
        }
        else if(match.ranking.length == 2 && 
            match.ranking[0].player2 && !match.ranking[0].player3 && 
            match.ranking[1].player2 && !match.ranking[1].player3){

            match.numberOfPlayers = 4;
        }
        else if(match.ranking.length == 2 && match.ranking[0].player3 && match.ranking[1].player3){
            match.numberOfPlayers = 6;
        }

        let positions = 1;
        for(let i = 0; i < mRank.length; i++){
            const p = mRank[i];

            if(!p.winner)
                p.winner = false;
            else{
                p.position = 1;
                match.winner = p.player1 + (p.player2 != undefined ? " - "+p.player2 : "") + (p.player3 != undefined ? " - "+p.player3 : "");;
            }

            if(i != 0 && p.territories == mRank[i-1].territories && p.troops == mRank[i-1].troops){
                positions--;
            }

            p.position = positions++;

            mNewRank.push(p);
        }

        mNewRank.sort((a,b) => b.positions - a.positions);

        match.ranking = mNewRank;
    });
}processMatches();

function lastResults(){
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
        <button value="${i}">
            <h1>${title}</h1>
            <p>Vencedor: <b>${match.winner}</b></p>
        </button>
        `;
        
    }
    html += "</div>"
    results.innerHTML = html;
}

function ranking(){
    let ranking = {};

    matches.forEach(match => {
        const mRank = match.ranking;
        let nmbrOfPlayers = match.numberOfPlayers;

        for(let i = 0; i < mRank.length; i++){
            const p = mRank[i];
            let playersInTeam = 1;

            if(p.hasOwnProperty("player2")) playersInTeam = 2;
            if(p.hasOwnProperty("player3")) playersInTeam = 3;

            if(!ranking.hasOwnProperty(p.player1)){
                ranking[p.player1] = {
                    name: p.player1,
                    pts: 0,
                    victories: 0,
                    podiums: 0,
                    matches: 0,
                    x1s: 0,
                };
            }
            if(playersInTeam == 2 && !ranking.hasOwnProperty(p.player2)){
                if(!ranking.hasOwnProperty(p.player1)){
                    ranking[p.player1] = {
                        name: p.player1,
                        pts: 0,
                        victories: 0,
                        podiums: 0,
                        x1s: 0,
                        matches: 0,
                    };
                }
                if(!ranking.hasOwnProperty(p.player2)){
                    ranking[p.player2] = {
                        name: p.player2,
                        pts: 0,
                        victories: 0,
                        podiums: 0,
                        x1s: 0,
                        matches: 0,
                    };
                }
            }
            if(playersInTeam == 3){
                if(!ranking.hasOwnProperty(p.player2)){
                    ranking[p.player2] = {
                        name: p.player2,
                        pts: 0,
                        victories: 0,
                        podiums: 0,
                        x1s: 0,
                        matches: 0,
                    };
                }
                if(!ranking.hasOwnProperty(p.player3)){
                    ranking[p.player3] = {
                        name: p.player3,
                        pts: 0,
                        victories: 0,
                        podiums: 0,
                        x1s: 0,
                        matches: 0,
                    };
                }
            }

            if(match.x1){
                if(match.ranking[i].position == 1){
                    ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers);
                }
                else{
                    ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers);
                }

                ranking[p.player1].x1s++;
            }

            if(!match.x1 && playersInTeam == 1){
                ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers);
                ranking[p.player1].matches++;
            }
            if(playersInTeam == 2){
                ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player1].matches++;
                ranking[p.player2].matches++;
            }
            if(playersInTeam == 3){
                ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player3].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player1].matches++;
                ranking[p.player2].matches++;
                ranking[p.player3].matches++;
            }
            
            if(match.ranking[i].position == 1 && !match.x1){
                ranking[p.player1].victories++;
                if(p.player2)
                    ranking[p.player2].victories++;
                if(p.player3)
                    ranking[p.player3].victories++;
            }
            if(i <= 2 && !match.x1) ranking[p.player1].podiums++;
        }
    });

    ranking = Object.entries(ranking);
    ranking.sort((a,b) => b[1].matches - a[1].matches);
    ranking.sort((a,b) => b[1].podiums - a[1].podiums);
    ranking.sort((a,b) => b[1].victories - a[1].victories);
    ranking.sort((a,b) => b[1].pts - a[1].pts);

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

    for (let i = 0; i < ranking.length; i++) {
        const e = ranking[i];

        let pos = i+1;

        html += `
        <tr id="${e[0]}">
            <td>${i+1}º</td>
            <td>${e[0]}</td>
            <td>${e[1].pts}</td>
            <td>${e[1].victories}</td>
            <td>${e[1].podiums}</td>
            <td>${e[1].matches}</td>
        </tr>
        `;
    }
    table.innerHTML = html;
    
    for(let i = 0; i < ranking.length; i++){
        const e = ranking[i];
        
        finalRanking[e[0]] = e[1];
    }
}


lastResults();
ranking();

const buttons = document.querySelectorAll("#results button");
buttons.forEach(el => {
    el.addEventListener("click", e => {
        const match = matches[el.value];

        let html = `
        <p>Vitória por: ${match.victory}</p>
        <img class="profile-photo" src="./img/matches/${match.img}.webp"/>
        <table id="match-result">
        <tr>
            <th>Pos</th>
            <th>Jogador</th>
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

            console.log(e)

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
                    
                        
                    html += `
                        <td>${pointSystem(e.position, match.numberOfPlayers, playersInSameTeam)}</td>
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
                        <td>${pointSystem(e.position, match.numberOfPlayers, playersInSameTeam)}</td>
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
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
            focusConfirm: false,
        });
    });
});

const players = document.querySelectorAll("table tr:nth-child(n+2)");
players.forEach(el => {
    el.addEventListener("click", e => {
        const name = el.id;
        const player = finalRanking[name];
        console.log(player)

        let html = `
        <img class="profile-photo" src="./img/players/${name}.webp"/>
        <table id="player-stats">
        <tr>
            <th>Posição Final Média</th>
            <th>Win Rate</th>
            <th>Pódios Rate</th>
            <th>Cor mais usada</th>
        </tr>
        <tr>
            <td>-</td>
            <td>${Math.round((player.victories / player.matches)*100)}%</td>
            <td>${Math.round((player.podiums / player.matches)*100)}%</td>
            <td>-</td>
        </tr>
        `; 

        Swal.fire({
            title: name,
            html: html,
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
            focusConfirm: false,
        });
    });
});