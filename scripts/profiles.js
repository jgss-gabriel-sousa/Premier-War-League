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

            const extraImages = [];
            for (let i = 1; i <= 3; i++) {
                const path = `./data/img/players/${name}_${i}.webp`;
                const img = new Image();
                img.src = path;
                img.onload = () => extraImages.push(path);
            }

            setTimeout(() => { // Espera o preload terminar
                let html = `<div class="profile-container">`;

                // Se houver imagens extras, cria o carrossel
                if (extraImages.length > 0) {
                    html += `
                    <div class="carousel">
                        <div class="carousel-track">
                            <img src="./data/img/players/${name}.webp" class="carousel-item active">
                            ${extraImages.map(path => `<img src="${path}" class="carousel-item">`).join("")}
                        </div>
                        <button class="carousel-btn prev">‹</button>
                        <button class="carousel-btn next">›</button>
                    </div>`;
                } 
                // Caso contrário, mostra apenas a imagem fixa
                else {
                    html += `<img class="profile-photo" src="./data/img/players/${name}.webp"/>`;
                }

                html += `
                    <table id="player-stats">
                        <tr>
                            <th>Pontos</th>
                            <th>Posição Final Média</th>
                        </tr>
                        <tr>
                            <td>${player.pts} de ${player.max_pts} = ${Math.round((player.pts/player.max_pts)*100)}%</td>
                            <td>${meanPosition}º</td>
                        </tr>
                        <tr>
                            <th>Vitórias</th>
                            <th>Pódios</th>
                        </tr>
                        <tr>
                            <td>${Math.round((player.victories / player.matches)*100)}%</td>
                            <td>${Math.round((player.podiums / player.matches)*100)}%</td>
                        </tr>
                        <tr>
                            <th>Cor mais usada</th>
                            <th>Liderança</th>
                        </tr>
                        <tr>
                            <td>${meanColor}</td>
                            ${player.leaderTime 
                                ? `<td>${player.leaderTime} dia${player.leaderTime > 1 ? "s" : ""}</td>` 
                                : "<td>Nunca Liderou</td>"}
                        </tr>
                    </table>
                </div>`;

                Swal.fire({
                    title: name,
                    html,
                    width: "800px",
                    showCloseButton: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                });

                // Só ativa o carrossel se houver imagens extras
                if (extraImages.length > 0) {
                    const track = document.querySelector(".carousel-track");
                    const items = document.querySelectorAll(".carousel-item");
                    const next = document.querySelector(".carousel-btn.next");
                    const prev = document.querySelector(".carousel-btn.prev");

                    let index = 0;
                    function updateCarousel() {
                        track.style.transform = `translateX(-${index * 100}%)`;
                    }

                    next.addEventListener("click", () => {
                        index = (index + 1) % items.length;
                        updateCarousel();
                    });

                    prev.addEventListener("click", () => {
                        index = (index - 1 + items.length) % items.length;
                        updateCarousel();
                    });
                }
            }, 200);
        });
    });
}