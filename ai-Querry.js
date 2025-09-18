const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { query = '', lang = 'hi-IN' } = event.queryStringParameters || {};
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error('xAI API key not set – https://x.ai/api से लें');

    const languageMap = {
      'hi-IN': 'Hindi',
      'ml-IN': 'Malayalam',
      'ta-IN': 'Tamil',
      'te-IN': 'Telugu',
      'mr-IN': 'Marathi',
      'gu-IN': 'Gujarati',
      'en-IN': 'English'
    };
    const langName = languageMap[lang] || 'Hindi';

    const prompt = `You are KisanVaani, an AI farming assistant for Kerala farmers. Answer in ${langName} on 18 Sep 2025, 12:03 PM IST. Query: "${query}". Provide accurate, concise advice:
- Weather: Kochi 26°C, light rain, 82% humidity; monsoon irrigation advice for Kuttanad paddy.
- Mandi prices: Tomato ₹26/kg, Banana ₹30/kg, Onion ₹12/kg, Mango ₹50/kg (Palakkad). Suggest sell timing.
- Crop problems: Yellow leaves = nitrogen deficiency, urea 25kg/acre; coconut bud rot = 1% Bordeaux spray.
- Schemes: PM-KISAN ₹6000/year, Kudumbashree loans, Krishi Bhavan subsidies.
- Soil: Laterite = NPK 10:10:10, 1kg/coconut tree; alluvial = DAP 20kg/acre for paddy.
- Irrigation: Monsoon-based pump scheduling (e.g., delay 3 days if rain).
Keep answers short, actionable, Kerala-focused.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`xAI API error: ${response.status}`);
    const data = await response.json();
    const aiAnswer = data.choices[0].message.content.trim();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ solution: aiAnswer })
    };
  } catch (error) {
    console.error('AI query error:', error);
    const fallbacks = {
      'hi-IN': 'AI जवाब: टमाटर ₹26/kg (पालक्काड), कोच्चि 26°C, बारिश। सवाल दोबारा पूछें!',
      'ml-IN': 'AI ഉത്തരം: തക്കാളി ₹26/kg (പാലക്കാട്), കൊച്ചി 26°C, മഴ। വീണ്ടും ചോദിക്കുക!'
    };
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: fallbacks[lang] || 'AI answer: Tomato ₹26/kg (Palakkad), Kochi 26°C, rain. Ask again!' })
    };
  }
};
