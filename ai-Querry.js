const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { query, lang = 'hi-IN' } = event.queryStringParameters || {};
    const apiKey = process.env.GOOGLE_API_KEY; // Set in Netlify
    if (!apiKey) throw new Error('Google API key missing.');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${query} (Respond in ${lang === 'hi-IN' ? 'Hindi' : lang === 'ml-IN' ? 'Malayalam' : 'English'} for Kerala farmers: weather, prices, crop advice).`
          }]
        }]
      })
    });

    if (!response.ok) throw new Error(`Google API error: ${response.status}`);
    const data = await response.json();
    const solution = data.candidates[0]?.content?.parts[0]?.text || 'No response from AI.';

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution, lang })
    };
  } catch (error) {
    console.error('AI Query error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        solution: lang === 'hi-IN'
          ? 'AI उत्तर उपलब्ध नहीं। फॉलबैक: मिट्टी की जांच करें।'
          : lang === 'ml-IN'
          ? 'AI ഉത്തരം ലഭ്യമല്ല. ഫോൾബാക്ക്: മണ്ണ് പരിശോധിക്കുക.'
          : 'AI response unavailable. Fallback: Test soil.'
      })
    };
  }
};
