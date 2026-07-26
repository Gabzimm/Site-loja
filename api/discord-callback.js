// POST /api/discord-callback  { code }
// Troca o "code" do OAuth do Discord pelo access_token e busca o usuário.
// Se o usuário for admin, devolve também um token de sessão de admin.
const { getDB, ehAdmin } = require('../lib/db');
const { gerarSessao } = require('../lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  try {
    const { code, redirect_uri } = req.body;
    if (!code) return res.status(400).json({ error: 'code obrigatório' });

    const tokenResp = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET, // só existe aqui, no servidor
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri
      })
    });
    if (!tokenResp.ok) {
      const erroTexto = await tokenResp.text();
      console.error('Discord recusou a troca do code:', tokenResp.status, erroTexto);
      return res.status(400).json({ error: 'code inválido ou expirado', detalhe: erroTexto });
    }
    const tokenData = await tokenResp.json();

    const userResp = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: 'Bearer ' + tokenData.access_token }
    });
    const usuario = await userResp.json();
    usuario.avatar = usuario.avatar
      ? 'https://cdn.discordapp.com/avatars/' + usuario.id + '/' + usuario.avatar + '.png'
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const data = await getDB();
    const isAdmin = await ehAdmin(data, usuario.id);
    const sessao = isAdmin ? gerarSessao(usuario.id) : null;

    return res.status(200).json({ usuario: usuario, admin: isAdmin, sessao: sessao });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'erro interno' });
  }
};
