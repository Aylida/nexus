// Vercel Serverless Function — tarayıcıdan gelen istekleri Anthropic API'ye iletir.
// API key burada, sunucu tarafında, process.env üzerinden okunur — tarayıcıya hiç gönderilmez.
// Vercel proje ayarlarında Environment Variables kısmına ANTHROPIC_API_KEY eklemen gerekir.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY tanımlı değil. Vercel ortam değişkenlerini kontrol et.' });
  }

  try {
    const { system, messages, max_tokens } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1500,
        system,
        messages,
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
}
