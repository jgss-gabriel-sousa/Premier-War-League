---
name: local-dev-and-qa
description: >-
  Use this skill to run the Premier War League site locally on Windows without
  requiring Node.js or Python, validate data integrity, and perform browser QA
  checks.
---

# Servidor Local e QA da Premier War League

Este ambiente Windows pode não ter Node.js ou Python instalados no PATH. Use o servidor HTTP nativo em PowerShell incluído nesta skill para testar o site localmente.

## 1. Subir o servidor local

Execute o script [serve.ps1](./scripts/serve.ps1) em modo daemon/background:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .agents/skills/local-dev-and-qa/scripts/serve.ps1 -Port 8765
```

O site ficará disponível em `http://localhost:8765/`.

## 2. Checklist de QA no navegador

Ao verificar alterações no navegador, confirme:
1. **Console e Rede:** `0` erros de console e `0` requisições `404` ou `500`.
2. **Classificação Geral:** ordenação clicável por coluna, filtro de temporada e ausência de overflow horizontal em desktop (`1440px`).
3. **Gráfico de Evolução:** rótulos de data no eixo X sem sobreposição e chips de jogadores clicáveis.
4. **Perfil do Jogador:** carrossel funcionando (ex.: `Bilu`), avatar SVG fallback para jogadores sem foto (ex.: `Lívia`, `Mateus`), confronto direto e histórico de partidas clicável.
5. **Modais de Partida:** partidas com foto, partidas sem foto (`img: null` exibindo placeholder) e partidas de equipe (`4 Duplas` em `27/12/2025`).
6. **`BANNED_PLAYERS`:** confirmar que nenhum jogador banido aparece na página principal, nos perfis ou nos modais de partidas.

## 3. Validação automatizada (quando Node.js 20+ estiver disponível ou no CI)

```bash
node scripts/validate.mjs
```

Valida schema ISO das datas, existência das imagens em disco, ausência de cores duplicadas em partidas solo, regras de pontuação, ordenação e ocultação de `BANNED_PLAYERS`.
