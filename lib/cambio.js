// ========================================================
// _cambio.js — conversão BRL -> EUR usada pela opção "MBY"
// Usa a exchangerate.host (gratuita, sem chave). Se ela falhar,
// cai para uma taxa fixa de segurança (ajuste TAXA_FALLBACK
// de vez em quando pra não ficar muito desatualizada).
// ========================================================

const TAXA_FALLBACK = 0.17; // 1 BRL ≈ 0.17 EUR — só usado se a API estiver fora do ar

async function buscarTaxaBRLparaEUR() {
  try {
    const r = await fetch('https://api.exchangerate.host/latest?base=BRL&symbols=EUR');
    const j = await r.json();
    if (j && j.rates && j.rates.EUR) return j.rates.EUR;
  } catch (e) {
    console.error('Falha ao buscar câmbio, usando fallback:', e);
  }
  return TAXA_FALLBACK;
}

async function converterBRLparaEUR(valorBRL) {
  const taxa = await buscarTaxaBRLparaEUR();
  return { valorEUR: Math.round(valorBRL * taxa * 100) / 100, taxa: taxa };
}

module.exports = { converterBRLparaEUR };
