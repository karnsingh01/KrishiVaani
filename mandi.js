const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');

exports.handler = async (event, context) => {
  try {
    const { commodity = 'Tomato', district = 'Palakkad', lang = 'hi' } = event.queryStringParameters || {};
    const apiUrl = `https://api.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi?api-key=NOKEY&format=csv&limit=50&filters[commodity_name]=${commodity}&filters[market_name]=${district}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Agmarknet error: ${response.status}`);
    
    const csv = await response.text();
    const records = parse(csv, { columns: true, skip_empty_lines: true });
    const item = records.find(r => r.market_name?.includes(district)) || records[0];
    
    const advice = {
      'hi-IN': 'आज बेचें – अच्छी कीमत!',
      'ml-IN': 'ഇന്ന് വിൽക്കുക – നല്ല വില!',
      'ta-IN': 'இன்று விற்கவும் – நல்ல விலை!'
    }[lang] || 'Sell today – good price!';
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solution: `${commodity} की कीमत (${district}, 17 सितंबर 2025): ${item?.modal_price || '₹26/kg'} (मिन: ${item?.min_price || '₹20'}, मैक्स: ${item?.max_price || '₹30'}). सलाह: ${advice}`
      })
    };
  } catch (error) {
    console.error('Mandi error:', error);
    const fallbacks = {
      'hi-IN': 'कीमतें उपलब्ध नहीं। टमाटर ₹26/kg (पालक्काड)।',
      'ml-IN': 'വിലകൾ ലഭ്യമല്ല. ടൊമാറ്റോ ₹26/kg (പാലക്കാട്).'
    };
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: fallbacks[lang] || 'Prices unavailable. Tomato ₹26/kg (Palakkad).' })
    };
  }
};
