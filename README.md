# Premier War League

Site estático para acompanhamento do ranking, estatísticas, evolução e histórico de partidas de **War** da Premier War League.

## Funcionalidades

- **Classificação Geral** com filtro por Temporada (Ano) e **ordenação clicável** por qualquer coluna da tabela.
- **Forma Recente** (últimas 5 partidas: Vitória, Pódio ou Derrota) direto na tabela.
- **Gráfico de Evolução do Aproveitamento** em SVG interativo, permitindo filtrar jogadores.
- **Perfil Detalhado do Jogador** com carrossel de fotos, aproveitamento, posição média, cor mais usada, tempo na liderança, confronto direto (*Head-to-Head*) e histórico clicável de partidas.
- **Zero dependências externas** (HTML5 `<dialog>`, ES Modules nativos, CSS moderno e SVG puro).

## Regras de Pontuação

O ranking geral é ordenado pelo **Aproveitamento (%)** de cada jogador:

$$\text{Aproveitamento} = \frac{\text{Pontos Obtidos (PO)}}{\text{Pontos Máximos Possíveis (PMax)}} \times 100\%$$

- **Qualificação:** exige pelo menos **3 partidas** disputadas (jogadores abaixo disso aparecem com `*`).
- **Critérios de desempate:** Vitórias → Pódios → Número de Partidas.
- **Pontuação por modo:**
  - Solo 6 jogadores: `10, 8, 6, 3, 2, 1`
  - Solo 5 jogadores: `8, 6, 3, 2, 1`
  - Solo 4 jogadores: `6, 3, 2, 1`
  - Solo 3 jogadores: `4, 2, 1`
  - 4 Duplas: `6, 3, 2, 1` | 3 Duplas: `5, 3, 1` | 2 Duplas / 2 Trios: `3, 1`

## Como adicionar uma nova partida

1. (Opcional) Salve a foto do tabuleiro em `data/img/matches/<nome-arquivo>.webp`.
2. Adicione a nova partida ao array `matches` em `data/matches.js`:

```js
{
    date: "2026-11-24", // Formato ISO YYYY-MM-DD
    img: "24-11-2026",  // Nome do arquivo .webp sem extensão (ou null se não houver foto)
    victory: "Dominar 24 Territórios",
    location: "Casa de Bilu",
    ranking: [
        {
            players: [{ name: "Coxinha", color: "Pretas" }],
            territories: 24,
            troops: 45,
            winner: true,
        },
        {
            players: [{ name: "Bilu", color: "Amarelas" }],
            territories: 10,
            troops: 18,
        },
    ],
}
```

3. Se um novo jogador tiver foto de perfil, salve o arquivo `.webp` em `data/img/players/` e registre-o em `PLAYER_PHOTOS` no arquivo `data/players.js`.

## Validação e Desenvolvimento Local

Para rodar localmente, sirva a pasta raiz com qualquer servidor HTTP estático (ex.: extensão Live Server do VS Code, `npx serve .` ou `python -m http.server`).

Para validar os dados, imagens e regras de pontuação com Node.js 20+:

```bash
node scripts/validate.mjs
```

O mesmo script é executado automaticamente no GitHub Actions antes de cada deploy para o GitHub Pages.
