// ========================================================
// _session.js — sessão de admin simples e real (substitui o
// antigo localStorage.getItem('admin_logado') === 'true')
// ========================================================
const crypto = require('crypto');

const SECRET = process.env.ADMIN_SESSION_SECRET; // string aleatória grande, só no servidor

// Gera um token: discordId + expiração + assinatura HMAC
function gerarSessao(discordId) {
  const expira = Date.now() + 1000 * 60 * 60 * 12; // 12 horas
  const payload = discordId + '.' + expira;
  const assinatura = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(payload + '.' + assinatura).toString('base64');
}

// Valida um token recebido no header Authorization
function validarSessao(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const partes = decoded.split('.');
    const discordId = partes[0], expira = Number(partes[1]), assinatura = partes[2];
    const payload = discordId + '.' + expira;
    const esperado = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (assinatura !== esperado) return null;
    if (Date.now() > expira) return null;
    return discordId;
  } catch (e) {
    return null;
  }
}

module.exports = { gerarSessao, validarSessao };
