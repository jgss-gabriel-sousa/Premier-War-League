---
name: add-match
description: >-
  Use this skill when the user wants to register a new War match, update match
  results, add a new player photo, or ban/hide a player in Premier War League.
---

# Cadastrar Nova Partida ou Jogador

Siga este procedimento ao adicionar novas partidas ou fotos ao repositório.

## Passos

1. **Verifique o schema e regras de pontuação** em [data-schema.md](./references/data-schema.md).
2. **Foto do tabuleiro (opcional):**
   - Salve a imagem em `data/img/matches/<nome-arquivo>.webp`.
   - Use o nome sem extensão no campo `img` da partida (ou `img: null` se não houver foto).
3. **Adicione a partida em `data/matches.js`:**
   - Use data em formato ISO (`YYYY-MM-DD`).
   - Ordene `ranking` da 1ª à última posição e marque exatamente uma entrada com `winner: true`.
   - Em partidas solo, confirme que não há cores duplicadas e que todas as cores existem em `ARMY_COLORS` (`Pretas`, `Brancas`, `Vermelhas`, `Azuis`, `Verdes`, `Amarelas`).
   - Para jogadores eliminados com `0` territórios/tropas, use `eliminationOrder` crescente (1 = primeiro eliminado) em vez de decimais em `troops`.
4. **Foto de perfil de jogador (se houver jogador novo ou foto extra):**
   - Salve em `data/img/players/<Nome>.webp` (ou `<Nome>_1.webp` para carrossel).
   - Registre o arquivo em `PLAYER_PHOTOS` dentro de `data/players.js`.
   - Se o jogador não tiver foto, não é preciso criar arquivo — o fallback SVG de iniciais será gerado automaticamente.
5. **Valide o resultado:**
   - Se Node.js 20+ estiver disponível: execute `node scripts/validate.mjs`.
   - Sempre verifique no navegador usando a skill `local-dev-and-qa` (0 erros de console, 0 erros 404, pontuação e modal corretos).
