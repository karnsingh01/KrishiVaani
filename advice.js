const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { query = '', lang = 'hi-IN' } = event.queryStringParameters || {};
    const apiKey = process.env.XAI_API_KEY; // Set in Netlify Environment Variables
    if (!apiKey) throw new Error('xAI API key not set – https://x.ai/api से लें');

    // AI Prompt for Farming Assistant
    const prompt = `You are KisanVaani, an AI farming assistant for Kerala farmers. Answer in ${lang === 'ml-IN' ? 'Malayalam' : 'Hindi'}. Query: "${query}". Provide accurate, fast advice on weather, mandi prices (Tomato ₹26/kg Palakkad, Banana ₹30/kg, etc., 18 Sep 2025), crop problems (yellow leaves = nitrogen deficiency, urea 25kg/acre), schemes (PM-KISAN ₹6000/year). Keep short, helpful.`;

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
    // Fallback Local AI-Like Response
    const fallbacks = {
      'hi-IN': 'AI जवाब: फसल समस्या बताएँ – मौसम कोच्चि में 26°C, हल्की बारिश। मंडी: टमाटर ₹26/kg।',
      'ml-IN': 'AI ഉത്തരം: ഫലപ്രശ്നം പറയൂ – കാലാവസ്ഥ കൊച്ചി 26°C, മഴ. മാർക്കറ്റ്: തക്കാളി ₹26/kg.'
    };
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: fallbacks[lang] || 'AI answer: Ask about crop issue – Kochi weather 26°C, rain. Mandi: Tomato ₹26/kg.' })
    };
  }
};
