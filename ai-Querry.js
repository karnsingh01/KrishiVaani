const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { query, lang } = event.queryStringParameters;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Query parameter is required' }),
    };
  }

  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error('XAI_API_KEY not set');

    const response = await fetch('https://api.x.ai/v1/grok', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        lang,
      }),
    });

    if (!response.ok) throw new Error(`Grok API error: ${response.status}`);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ solution: data.answer || 'AI जवाब उपलब्ध नहीं।' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error: ' + error.message }),
    };
  }
};
