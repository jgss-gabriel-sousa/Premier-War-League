# Changelog

Todas as mudanças notáveis da **Premier War League** serão documentadas neste arquivo.

## [2.0.0] - 2026-11-25

### Adicionado
- **Gráfico de Evolução do Aproveitamento** em SVG interativo (`scripts/chart.js`) com chips clicáveis para filtrar jogadores.
- **Filtro por Temporada (Ano)** no cabeçalho e **ordenação clicável** por qualquer coluna da tabela de classificação.
- **Forma Recente** (últimas 5 partidas: Vitória, Pódio ou Derrota) exibida diretamente na tabela principal e no perfil do jogador.
- **Perfil detalhado do jogador** (`scripts/profiles.js`) com carrossel determinístico de fotos, 8 cards de estatísticas (média de territórios/tropas, melhor sequência de vitórias, parceiro mais frequente, líder atual), **Confronto Direto (Head-to-Head)** e **Histórico de Partidas** clicável.
- **Metadados de jogadores e avatares fallback** (`data/players.js`) com gerador de avatar SVG com iniciais para jogadores sem foto e badges coloridas para os exércitos.
- **Modal nativo `<dialog>`** (`scripts/ui.js`), eliminando a dependência externa do SweetAlert2 via CDN.
- **Validação automatizada e testes** (`scripts/validate.mjs`) integrados ao GitHub Actions (`.github/workflows/static.yml`) antes do deploy no GitHub Pages.
- **Documentação do projeto** (`README.md`) com regras da liga e guia para cadastro de novas partidas.

### Alterado
- **Renovação visual e responsividade** (`index.html`, `styles.css`): HTML semântico, paleta inspirada na Premier League com variáveis CSS, `font-display: swap`, substituição do `overflow-y: overlay` depreciado, navegação por teclado na tabela e breakpoints para tablet e mobile.
- **Novo schema de dados** (`data/matches.js`): migração para `players: [{ name, color }]`, datas em formato ISO (`YYYY-MM-DD`) e campo explícito `eliminationOrder` (no lugar de valores decimais em `troops`).
- **Camada de lógica pura** (`scripts/processMatches.js`, `scripts/ranking.js`, `scripts/orderRanking.js`): eliminação de mutações no array importado de partidas.

### Corrigido
- Suporte explícito para partidas de **4 Duplas** (`27/12/2025`), corrigindo a pontuação e impedindo contagem indevida de pódio.
- Bug de ordenação em `scripts/orderRanking.js` quando jogadores tinham `0` pódios (falsy check) e alinhamento da regra de qualificação para `>= 3` partidas.
- Cálculo de tempo na liderança (`leaderTime`) para lidar corretamente com empates na 1ª posição.
- Ocultação total de `BANNED_PLAYERS` em toda a interface (tabela, gráfico, confrontos diretos, parceiros e modais de partidas) sem risco de `TypeError`.
- Remoção do `setTimeout(200)` e das requisições 404 de imagens extras de perfil e de partidas sem foto registrada (`img: null`).
- Correção da cor duplicada na partida `2024-02-11` (`Luiz` atualizado para `Azuis`).

### Removido
- Ranking X1, partidas X1 (`scripts/x1Ranking.js` e registros `x1` em `data/matches.js`) e controles associados na interface.
- Código morto: `scripts/processLeaderTime.js` e funções não utilizadas de `scripts/pointsFunc.js`.
- Dependência externa do SweetAlert2 via CDN.
