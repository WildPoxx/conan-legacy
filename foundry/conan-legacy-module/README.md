# Conan Legacy Foundry Module

Modulo nativo de Foundry VTT para Conan Legacy em SWADE.

Baseline tecnico:

- Foundry VTT `13.351`
- SWADE `5.2.6`
- Dados canonicos em `../../data/conan-legacy/`

## Escopo inicial

Este pacote nasce pequeno por decisao arquitetural. Ele existe para receber compendios e scripts gerados a partir da camada canonica, nao para virar uma segunda fonte manual.

## Estrutura

- `module.json`: manifesto instalavel do modulo.
- `scripts/`: inicializacao, diagnostico e futuras rotinas de import/export.
- `styles/`: ajustes visuais proprios.
- `templates/`: templates futuros para dialogs, sheets auxiliares ou dashboards.
- `lang/`: strings localizadas.
- `packs/`: compendios gerados pelo pipeline.
- `assets/`: imagens, icones e midia autorizada.

## Pipeline esperado

1. Atualizar registros em `data/conan-legacy/`.
2. Rodar `tools/conan-data/validate-canonical-data.mjs`.
3. Converter registros canonicos para payload SWADE/FVTT.
4. Gerar ou atualizar compendios em `packs/`.
5. Validar o manifesto e instalar o modulo em mundo de teste.

## Regra de manutencao

Nao editar compendios como fonte primaria. Ajustes devem voltar para a camada canonica e ser regenerados.
