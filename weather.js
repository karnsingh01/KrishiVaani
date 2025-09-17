const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { city = 'Kochi', lang = 'hi' } = event.queryStringParameters || {};
    const cityIds = { Kochi: '43353', Thrissur: '43351', Palakkad: '43355' };
    const cityId = cityIds[city] || '43353';
    const url = `https://city.imd.gov.in/api/cityweather.php?id=${cityId}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`IMD API error: ${response.status}`);
    
    const data = await response.json();
    const advice = {
      'hi-IN': 'बारिश के बाद सिंचाई टालें।',
      'ml-IN': 'മഴയ്ക്ക് ശേഷം ജലസേചനം വൈകിപ്പിക്കുക.',
      'ta-IN': 'மழைக்குப் பின் நீர்ப்பாசனம் தாமதப்படுத்தவும்.',
      'te-IN': 'వర్షం తర్వాత నీటిపారుదల ఆలస్యం చేయండి.',
      'mr-IN': 'पावसानंतर सिंचन पुढे ढकला.',
      'gu-IN': 'વરસાદ પછી સિંચાઈ મુલતવી રાખો.',
      'en-IN': 'Delay irrigation after rain.'
    }[lang] || 'Delay irrigation after rain';
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solution: `मौसम (${city}, 17 सितंबर 2025): ${data.temp || '25-30°C'}, ${data.weather || 'बादल और हल्की बारिश'}। नमी: ${data.humidity || '80%'}। बारिश: ${data.rainfall || '10mm'}। सलाह: ${advice}`
      })
    };
  } catch (error) {
    console.error('Weather error:', error);
    const fallbacks = {
      'hi-IN': 'मौसम उपलब्ध नहीं। 25-30°C, हल्की बारिश।',
      'ml-IN': 'കാലാവസ്ഥ ലഭ്യമല്ല. 25-30°C, മഴ.',
      'ta-IN': 'வானிலை கிடைக்கவில்லை. 25-30°C, மழை.'
    };
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: fallbacks[lang] || 'Weather unavailable. 25-30°C, rain.' })
    };
  }
};
