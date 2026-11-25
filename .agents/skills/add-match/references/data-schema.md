# Referência de Schema de Dados e Pontuação

## `data/matches.js`

Cada item do array `matches` segue este formato:

```js
{
    date: "2026-11-25",        // Obrigatório: ISO YYYY-MM-DD
    img: "25-11-2026",         // Nome do .webp em data/img/matches/ sem extensão, ou null
    victory: "Dominar 24 Territórios",
    location: "Casa de Bilu",
    ranking: [
        {
            players: [{ name: "Coxinha", color: "Pretas" }],
            territories: 24,
            troops: 45,
            winner: true,      // Exatamente 1 entrada por partida
        },
        {
            players: [{ name: "Bilu", color: "Amarelas" }],
            territories: 0,
            troops: 0,
            eliminationOrder: 1, // Opcional: desempate de eliminados (maior = durou mais)
        },
    ],
}
```

### Partidas em Equipe
Para duplas ou trios, coloque os integrantes no mesmo array `players` da entrada:
- **2 Duplas:** 2 entradas com 2 jogadores cada → pontos `[3, 1]`
- **3 Duplas:** 3 entradas com 2 jogadores cada → pontos `[5, 3, 1]`
- **4 Duplas:** 4 entradas com 2 jogadores cada → pontos `[6, 3, 2, 1]`
- **2 Trios:** 2 entradas com 3 jogadores cada → pontos `[3, 1]`

### Partidas Solo
- **6 jogadores:** `[10, 8, 6, 3, 2, 1]`
- **5 jogadores:** `[8, 6, 3, 2, 1]`
- **4 jogadores:** `[6, 3, 2, 1]`
- **3 jogadores:** `[4, 2, 1]`

## `data/players.js`

- `BANNED_PLAYERS`: lista de nomes que **nunca** são exibidos na tela.
- `PLAYER_PHOTOS`: mapa `{ [nome]: ["Arquivo.webp", "Arquivo_1.webp"] }` que controla a foto principal e o carrossel do perfil sem gerar 404s.
- `ARMY_COLORS`: mapa de cores válidas (`Pretas`, `Brancas`, `Vermelhas`, `Azuis`, `Verdes`, `Amarelas`).
