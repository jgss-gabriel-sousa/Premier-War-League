# Premier War League — Regras do Repositório

## Arquitetura e Stack
- **100% estático, zero dependências externas e sem etapa de build** (hospedado diretamente no GitHub Pages via `.github/workflows/static.yml`).
- Usar apenas **HTML5 nativo** (incluindo `<dialog>` para modais), **CSS moderno** (CSS Custom Properties em `styles.css`) e **ES Modules nativos** (`type="module"`). Não adicionar CDNs externas nem frameworks pesados.
- Manter separação estrita entre:
  - **Dados:** `data/matches.js`, `data/players.js`
  - **Lógica pura (sem mutar `matches` e sem acessar DOM):** `scripts/pointsFunc.js`, `scripts/processMatches.js`, `scripts/orderRanking.js`, `scripts/ranking.js`
  - **Interface e visualização:** `app.js`, `scripts/ui.js`, `scripts/chart.js`, `scripts/profiles.js`, `scripts/lastResults.js`

## Regras de Negócio Invioláveis
- **`BANNED_PLAYERS` nunca aparece na tela:** qualquer jogador listado em `BANNED_PLAYERS` (`data/players.js`) deve permanecer oculto em toda a interface — tabela de classificação, gráfico de evolução, confrontos diretos (*Head-to-Head*), parceiros de equipe, rótulo de vencedor e modal de detalhes da partida. A contagem total de jogadores e posições da partida original continua preservada para não distorcer a pontuação dos demais participantes.
- **Sem modo X1:** ranking e partidas de X1 foram removidos intencionalmente do projeto. Não reintroduzir abas, scripts ou partidas X1 a menos que solicitado explicitamente.
- **Qualificação no ranking:** exige pelo menos **3 partidas** (`MIN_MATCHES_TO_QUALIFY = 3` em `scripts/orderRanking.js`). Jogadores abaixo disso ficam abaixo dos qualificados e exibem `*` no aproveitamento.
- **Ordem de desempate:** Aproveitamento arredondado (`roundedPercentage`) → Vitórias → Pódios → Partidas → Nome (`pt-BR`). Nunca usar checks falsy (`if (a.podiums)`) em campos numéricos que podem ser `0`.
- **Pódios:** contam apenas para posições `<= 3` em partidas **solo** (`!match.inTeam`) com `>= 3` jogadores. Partidas em equipe (`2 Duplas`, `3 Duplas`, `4 Duplas`, `2 Trios`) **não** contam pódio.

## Dados e Assets
- Datas em `data/matches.js` sempre no formato ISO `YYYY-MM-DD`.
- Entradas de partida sempre usam `players: [{ name, color }]` (nunca `player1`/`player2`/`player3`).
- Ordem de eliminação para jogadores com `0` territórios/tropas deve usar `eliminationOrder: <número>` (nunca valores decimais em `troops`).
- Fotos de jogadores devem ser registradas explicitamente em `PLAYER_PHOTOS` (`data/players.js`) para evitar requisições 404. Jogadores sem foto usam automaticamente o avatar SVG de iniciais.
- Partidas sem foto do tabuleiro devem usar `img: null`.

## Validação e Deploy
- Sempre manter `scripts/validate.mjs` atualizado quando alterar regras de pontuação, schema de dados ou lista de fotos.
- O workflow `.github/workflows/static.yml` executa `node scripts/validate.mjs` antes de publicar no GitHub Pages.
- Evitar propriedades CSS depreciadas (como `overflow-y: overlay`) e garantir que todos os elementos interativos (linhas da tabela, modais, carrossel) sejam acessíveis via teclado e sem erros de console/404.
