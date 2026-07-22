const MASTER_EMAIL = 'popota@gmail.com';
const MAX_DOSSIER_LENGTH = 120000;

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const dossier = String(payload.dossier || '').trim();
    const pcName = sanitizeText_(payload.pcName || 'Personagem sem nome');
    const playerName = sanitizeText_(payload.playerName || 'Jogador nao informado');
    const playerEmail = sanitizeEmail_(payload.playerEmail || '');

    if (!dossier) return json_({ ok: false, error: 'Dossie vazio.' });
    if (dossier.length > MAX_DOSSIER_LENGTH) return json_({ ok: false, error: 'Dossie muito grande.' });

    const subject = `Conan Legacy - Heroe Forge - ${pcName}`;
    const body = `${dossier}\n\n---\nEnviado pelo Heroe Forge - Conan Legacy\nJogador: ${playerName}\nE-mail do jogador: ${playerEmail || '-'}\nRecebido em: ${new Date().toLocaleString('pt-BR')}`;

    const message = {
      to: MASTER_EMAIL,
      subject,
      body,
      name: 'Heroe Forge - Conan Legacy'
    };
    if (playerEmail) message.replyTo = playerEmail;

    MailApp.sendEmail(message);
    return json_({ ok: true, message: 'Dossie enviado ao Mestre.' });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'Heroe Forge - Conan Legacy', accepts: 'POST' });
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function sanitizeText_(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 120);
}

function sanitizeEmail_(value) {
  const email = String(value || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}