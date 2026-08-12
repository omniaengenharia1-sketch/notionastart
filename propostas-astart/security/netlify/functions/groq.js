// Função que fala com a Groq no servidor, escondendo a chave.
// A chave fica na variável de ambiente GROQ_KEY (painel do Netlify),
// nunca no navegador. O app passa a chamar /.netlify/functions/groq.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const KEY = process.env.GROQ_KEY;
  if (!KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GROQ_KEY não configurada no Netlify' }) };
  }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + KEY,
        'Content-Type': 'application/json'
      },
      body: event.body // repassa o mesmo corpo que o app já monta (model, messages, temperature)
    });
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
