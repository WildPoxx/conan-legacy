# Conan Legacy Canonical Data

Esta pasta e a camada tecnica canonica para conteudo de Conan Legacy que precisa alimentar o gerador de personagem e, depois, o modulo nativo de Foundry VTT.

Ela nao substitui os textos de leitura da wiki, nem os documentos criativos do Vault. A funcao dela e manter registros estaveis, com IDs, status editorial, referencias de fonte e campos previsiveis para conversao.

## Camadas

- `equipment.json`: itens, servicos, montarias, transporte e pacotes iniciais.
- `edges.json`: Vantagens de cenario e Vantagens SWADE expostas pelo gerador.
- `hindrances.json`: Desvantagens SWADE e Desvantagens de cenario.
- `backgrounds.json`: Backgrounds Culturais e seus beneficios automaticos.
- `schemas/`: contrato tecnico inicial para validacao local.

## Status editorial

- `canon`: pronto para ser tratado como fonte tecnica.
- `draft`: registrado, mas ainda pode mudar.
- `approved`: homologado para uso.
- `approved_for_playtest`: mecanica aprovada para teste de mesa.
- `revision_required`: material precisa de revisao antes de export.
- `vetoed`: nao usar.
- `gm_only`: apenas Mestre.

## Regra de ouro

O gerador e o modulo Foundry devem consumir esta camada, diretamente ou por adaptadores. Textos publicos continuam sendo vitrine; documentos internos continuam sendo fonte criativa; estes arquivos sao o estoque numerado.
