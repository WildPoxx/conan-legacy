# Heroe Forge: envio automatico por Google Apps Script

Este script recebe o dossie do gerador e envia um e-mail para `popota@gmail.com` usando a conta Google que publicar o Web App.

## Publicacao

1. Acesse https://script.google.com/ com a conta que deve enviar os e-mails.
2. Crie um novo projeto.
3. Cole o conteudo de `tools/google-apps-script/heroe-forge-email.gs` no arquivo `Code.gs`.
4. Clique em `Deploy` > `New deployment`.
5. Escolha o tipo `Web app`.
6. Em `Execute as`, selecione `Me`.
7. Em `Who has access`, selecione `Anyone` ou `Anyone with the link`.
8. Autorize o envio de e-mail quando o Google pedir permissao.
9. Copie a URL terminada em `/exec`.
10. Cole essa URL em `docs/heroe-forge-email-config.js` como `window.CONAN_LEGACY_EMAIL_ENDPOINT`.
11. Para Google Apps Script, defina `window.CONAN_LEGACY_EMAIL_ENDPOINT_MODE = "apps-script"`.

## Observacao importante

No modo `apps-script`, o navegador consegue chamar o Web App sem abrir cliente de e-mail, mas pode nao conseguir ler a resposta por causa de CORS. Por isso o gerador registra que a solicitacao foi enviada ao endpoint, enquanto a confirmacao final deve ser conferida no e-mail do Mestre ou no log do Apps Script.