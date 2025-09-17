const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { city = 'Kochi', lang = 'en' } = event.queryStringParameters || {};
    const cityIds = { Kochi: '43353', Thrissur: '43351', Palakkad: '43355' };
    const cityId = cityIds[city] || '43353';
    const url = `https://city.imd.gov.in/api/cityweather.php?id=${cityId}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`IMD API error: ${response.status}`);
    
    const data = await response.json();
    const advice = lang === 'ml' ? 'മഴയ്ക്ക് ശേഷം ജലസേചനം വൈകിപ്പിക്കുക' : 'Delay irrigation post-rain';
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temp: data.temp || '25-30°C',
        condition: data.weather || 'Cloudy with light rain',
        humidity: data.humidity || '80%',
        rainfall: data.rainfall || 'Light (10mm)',
        tip: advice
      })
    };
  } catch (error) {
    console.error('Weather error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: 'കാലാവസ്ഥ ലഭ്യമല്ല. ഫോൾബാക്ക്: 28°C, humid monsoon.' })
    };
  }
};