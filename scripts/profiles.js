export function profiles(ranking){
    const players = document.querySelectorAll("table tr:nth-child(n+2)");
    players.forEach(el => {
        el.addEventListener("click", e => {
            const name = el.id;
            const player = ranking[name];

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
}