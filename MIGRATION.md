# Relatorio de Migracao

Data: 2026-07-22

## Origem

`G:\Meu Drive\01.RPG\01. Minhas Campanhas\Gurps Conan\Conan Legacy`

## Destino

`C:\Users\amari\source\conan-legacy`

## Resultado da copia

- Metodo: copia validada, mantendo o Drive G como backup.
- Arquivos na origem, sem `.gdoc`: 277
- Arquivos `.gdoc` na origem: 20
- Arquivos nao-`.gdoc` copiados inicialmente: 277
- Tamanho da origem sem `.gdoc`: 782.46 MB
- Tamanho copiado inicialmente: 782.46 MB

## Observacao sobre Google Docs

Os arquivos `.gdoc` do Google Drive nao foram copiados como conteudo textual. No Windows/Google Drive eles se comportam como ponteiros para documentos remotos e retornaram erro de leitura durante a copia. Isso nao apaga nem altera os documentos originais no Drive G.

Acao futura recomendada: exportar manualmente ou por Google Drive os documentos relevantes para Markdown ou PDF antes de publica-los.

## Decisoes de publicacao

- Repositorio publico: sim.
- Superficie publica: curada e sem spoilers.
- Wiki: pasta `wiki/` versionada dentro do repo.
- Portal: `docs/index.html`, adequado para GitHub Pages.
- Arquivos pesados e materiais comerciais: preservados localmente na copia, mas ignorados pelo Git publico.
