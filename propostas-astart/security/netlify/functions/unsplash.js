// Função que busca fotos no Unsplash no servidor, escondendo a chave.
// A chave fica na variável de ambiente UNSPLASH_KEY (painel do Netlify).
// O app passa a chamar /.netlify/functions/unsplash?query=...
exports.handler = async (event) => {
  const KEY = process.env.UNSPLASH_KEY;
  if (!KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'UNSPLASH_KEY não configurada no Netlify' }) };
  }
  const params = event.queryStringParameters || {};
  const query = params.query || '';
  const url = 'https://api.unsplash.com/search/photos'
    + '?query=' + encodeURIComponent(query)
    + '&per_page=10&orientation=landscape&content_filter=high'
    + '&client_id=' + KEY;
  try {
    const res = await fetch(url);
    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: text
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: String(e) }) };
  }
};
