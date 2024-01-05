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
        
        /*
        if(match.ranking.length == 2 && match.ranking[0].player2 == undefined && match.ranking[1].player2 == undefined){
            match.x1 = true;
        }
        */
        if(match.ranking.length == 2 && 
            match.ranking[0].player2 && !match.ranking[0].player3 && 
            match.ranking[1].player2 && !match.ranking[1].player3){ //2 Duplas

            match.numberOfPlayers = 4;
            match.inTeam = true;
        }
        else if(match.ranking.length == 3 && !match.ranking[0].player3 && !match.ranking[1].player3){ //3 Duplas
            match.numberOfPlayers = 6;
            match.inTeam = true;
        }
        else if(match.ranking.length == 2 && match.ranking[0].player3 && match.ranking[1].player3){ //2 Trios
            match.numberOfPlayers = 6;
            match.inTeam = true;
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
                    ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers);
                }
                else{
                    ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers);
                }

                ranking[p.player1].x1s++;
            }

            if(!match.x1 && playersInTeam == 1){
                ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers);
                ranking[p.player1].max_pts += pointSystem(1, nmbrOfPlayers);
                ranking[p.player1].matches++;
                ranking[p.player1].positionsHistory.push(match.ranking[i].position);
                ranking[p.player1].colorsHistory.push(match.ranking[i].color);
            }
            if(playersInTeam == 2){
                ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player1].max_pts += pointSystem(1, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].max_pts += pointSystem(1, nmbrOfPlayers, playersInTeam);
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
                ranking[p.player1].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player3].pts += pointSystem(match.ranking[i].position, nmbrOfPlayers, playersInTeam);
                ranking[p.player1].max_pts += pointSystem(1, nmbrOfPlayers, playersInTeam);
                ranking[p.player2].max_pts += pointSystem(1, nmbrOfPlayers, playersInTeam);
                ranking[p.player3].max_pts += pointSystem(1, nmbrOfPlayers, playersInTeam);
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


    function generateRanking(data) {
        // Converte o objeto em um array de pares chave-valor
        const playerEntries = Object.entries(data);
    
        // Ordena os jogadores com base nos pontos, vitórias e pódios
        playerEntries.sort((a, b) => {
            const pointsComparison = b[1].pts - a[1].pts;
            if (pointsComparison !== 0) {
                return pointsComparison;
            }
    
            const victoriesComparison = b[1].victories - a[1].victories;
            if (victoriesComparison !== 0) {
                return victoriesComparison;
            }
    
            const podiumsComparison = b[1].podiums - a[1].podiums;
            if (podiumsComparison !== 0) {
                return podiumsComparison;
            }
    
            const matchesComparison = b[1].matches - a[1].matches;
            if (matchesComparison !== 0) {
                return matchesComparison;
            }
    
            // Se tudo mais falhar, use a ordem original
            return 0;
        });
    
        // Cria um objeto para armazenar as posições finais
        const newRank = {};
        let currentPosition = 1;
    

        // Preenche o objeto de ranking com base na ordem ordenada
        for (let i = 0; i < playerEntries.length; i++) {
            const [player, details] = playerEntries[i];
    
            if (i > 0 && (
                details.pts !== playerEntries[i - 1][1].pts ||
                details.victories !== playerEntries[i - 1][1].victories ||
                details.podiums !== playerEntries[i - 1][1].podiums ||
                details.matches !== playerEntries[i - 1][1].matches
                )) {
                currentPosition = i + 1;
            }

            console.log(player+"-"+currentPosition)

            newRank[player] = { 
                name: player, 
                position: currentPosition, 
                pts: details.pts, 
                victories: details.victories, 
                podiums: details.podiums,
                matches: details.matches,
            };

            ranking[player].finalPosition = currentPosition;
        }
    
        return newRank;
    }
    finalRanking = generateRanking(ranking);

    /*
    // Imprime o resultado do ranking
    for (const player in rankingResult) {
        console.log(`${rankingResult[player].position} - ${player}: ${rankingResult[player].points} pontos`);
    }

    console.log(rankingResult)
    


    ranking = Object.entries(ranking);
    ranking.sort((a,b) => b[1].matches - a[1].matches);
    ranking.sort((a,b) => b[1].podiums - a[1].podiums);
    ranking.sort((a,b) => b[1].victories - a[1].victories);
    ranking.sort((a,b) => b[1].pts - a[1].pts);*/


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
        <tr id="${e.name}">
            <td>${e.position}º</td>
            <td>${e.name}</td>
            <td>${e.pts}</td>
            <td>${e.victories}</td>
            <td>${e.podiums}</td>
            <td>${e.matches}</td>
        </tr>
        `;
    }
    table.innerHTML = html;

    finalRanking = Object.entries(ranking);
    for(let i = 0; i < finalRanking.length; i++){
        const e = finalRanking[i];
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
                        <td>${e.color.split("-")[0]}</td>
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
            width: "600px",
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

        let meanPosition = 0;
        for(let i = 0; i < player.positionsHistory.length; i++) {
            meanPosition += player.positionsHistory[i];
        }
        meanPosition /= player.matches;
        meanPosition = meanPosition.toFixed(1);
        
        let meanColorObj = {};
        for(let i = 0; i < player.colorsHistory.length; i++) {
            const color = player.colorsHistory[i];

            if(meanColorObj.hasOwnProperty(color)){
                meanColorObj[color] = meanColorObj[color]+1;
            }
            else{
                meanColorObj[color] = 1;
            }
        }
        let meanColor;
        let meanColorMax = 0;
        let draw = 0;
        for(const c in meanColorObj) {
            if(meanColorObj[c] > meanColorMax){
                meanColorMax = meanColorObj[c];
                meanColor = c;
                draw = 0;
            }
            else if(meanColorObj[c] == meanColorMax){
                meanColor += "/"+c;
                draw++;
            }

            if(draw > 2){
                meanColor = "*";
            }
        }
        if(draw <= 2){
            meanColor += " ("+meanColorMax+"x)";
        }

        let html = `
        <img class="profile-photo" src="./data/img/players/${name}.webp"/>
        <table id="player-stats">
            <tr>
                <th>Aproveitamento</th>
                <th>Posição Final Média</th>
            </tr>
            <tr>
                <td>${Math.round((player.pts / player.max_pts)*100)}%</td>
                <td>${meanPosition}º</td>
            </tr>
                <th>Vitórias</th>
                <th>Pódios</th>
            </tr>
            <tr>
                <td>${Math.round((player.victories / player.matches)*100)}%</td>
                <td>${Math.round((player.podiums / player.matches)*100)}%</td>
            </tr>
            <tr>
                <th>Cor mais usada</th>
            </tr>
            <tr>
                <td>${meanColor}</td>
            </tr>
        `; 

        Swal.fire({
            title: name,
            html: html,
            width: "800px",
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
            focusConfirm: false,
        });
    });
});