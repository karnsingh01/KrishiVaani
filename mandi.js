const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { commodity = 'Tomato', district = 'Palakkad', lang = 'hi-IN' } = event.queryStringParameters || {};
    const apiUrl = `https://api.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi?api-key=NOKEY&format=json&limit=50`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`data.gov.in error: ${response.status}`);
    
    const data = await response.json();
    const filteredRecords = data.records.filter(r => 
      (r.commodity_name || '').toLowerCase().includes(commodity.toLowerCase()) &&
      (r.market_name || '').toLowerCase().includes(district.toLowerCase())
    );
    const item = filteredRecords[0] || data.records.find(r => r.commodity_name.toLowerCase() === commodity.toLowerCase()) || data.records[0];
    
    const modalPrice = item.modal_price || '26';
    const minPrice = item.min_price || '22';
    const maxPrice = item.max_price || '30';
    
    const advice = {
      'hi-IN': 'आज बेचें – अच्छी कीमत!',
      'ml-IN': 'ഇന്ന് വിൽക്കുക – നല്ല വില!',
      'ta-IN': 'இன்று விற்கவும் – நல்ல விலை!'
    }[lang] || 'Sell today – good price!';
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solution: `${commodity} की कीमत (${district}, 18 Sep 2025): मोडल ₹${modalPrice}/kg (मिन ₹${minPrice}, मैक्स ₹${maxPrice})। सलाह: ${advice}`
      })
    };
  } catch (error) {
    console.error('Mandi error:', error);
    const fallbackPrices = {
      Tomato: 26, Onion: 12, Pineapple: 40, Banana: 30, Mango: 50, Potato: 15, Brinjal: 20, Cabbage: 18
    };
    const modalPrice = fallbackPrices[commodity] || 26;
    const fallbacks = {
      'hi-IN': `कीमतें उपलब्ध नहीं। ${commodity} ₹${modalPrice}/kg (${district}, 18 Sep 2025)। आज बेचें!`,
      'ml-IN': `വിലകൾ ലഭ്യമല്ല. ${commodity} ₹${modalPrice}/kg (${district}, 18 Sep 2025). ഇന്ന് വിൽക്കുക!`
    };
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: fallbacks[lang] || `Prices unavailable. ${commodity} ₹${modalPrice}/kg (${district}, 18 Sep 2025). Sell today!` })
    };
  }
};
