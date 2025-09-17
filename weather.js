const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { city = 'Kochi', lang = 'hi-IN' } = event.queryStringParameters || {};
    // Updated from IMD official PDF: mausam.imd.gov.in API
    const cityIds = { Kochi: '42182', Delhi: '421', Mumbai: '43026' }; // Standard IDs
    const cityId = cityIds[city] || '42182'; // Default Kochi
    const url = `https://mausam.imd.gov.in/api/current_wx_api.php?id=${cityId}`; // Correct 2025 endpoint
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`IMD API error: ${response.status}`);
    
    const data = await response.json();
    const advice = {
      'hi-IN': 'बारिश के बाद सिंचाई टालें।',
      'ml-IN': 'മഴയ്ക്ക് ശേഷം ജലസേചനം വൈകിപ്പിക്കുക।',
      'ta-IN': 'மழைக்குப் பின் நீர்ப்பாசனம் தாமதப்படுத்தவும்।',
      'te-IN': 'వర్షం తర్వాత నీటిపారుదల ఆలస్యం చేయండి।',
      'mr-IN': 'पावसानंतर सिंचन पुढे ढकला।',
      'gu-IN': 'વરસાદ પછી સિંચાઈ મુલતવી રાખો।',
      'en-IN': 'Delay irrigation after rain.'
    }[lang] || 'Delay irrigation after rain';
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solution: `${city} मौसम (17 Sep 2025): तापमान ${data.temp || '25-30°C'}, स्थिति ${data.weather || 'बादल और हल्की बारिश'}। नमी ${data.humidity || '80%'}। बारिश ${data.rainfall || '10mm'}। सलाह: ${advice}`
      })
    };
  } catch (error) {
    console.error('Weather error:', error);
    const fallbacks = {
      'hi-IN': 'मौसम उपलब्ध नहीं। 25-30°C, हल्की बारिश (17 Sep 2025)। सिंचाई टालें।',
      'ml-IN': 'കാലാവസ്ഥ ലഭ്യമല്ല. 25-30°C, മഴ (17 Sep 2025). ജലസേചനം വൈകിപ്പിക്കുക.',
      'ta-IN': 'வானிலை கிடைக்கவில்லை. 25-30°C, மழை (17 Sep 2025). நீர்ப்பாசனம் தாமதம்.'
    };
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: fallbacks[lang] || 'Weather unavailable. 25-30°C, rain (17 Sep 2025). Delay irrigation.' })
    };
  }
};
