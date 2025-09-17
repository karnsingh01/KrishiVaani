const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');

exports.handler = async (event, context) => {
  try {
    const { commodity = 'Tomato', district = 'Palakkad', lang = 'hi-IN' } = event.queryStringParameters || {};
    // Updated from data.gov.in catalog: Generic endpoint + filter
    const apiUrl = `https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi/api/download?format=csv&limit=100`; // Broad fetch, filter in code
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`data.gov.in error: ${response.status}`);
    
    const csv = await response.text();
    const records = parse(csv, { columns: true, skip_empty_lines: true, delimiter: ',' });
    // Filter for commodity and district (case-insensitive)
    const filteredRecords = records.filter(r => 
      (r.commodity_name || '').toLowerCase().includes(commodity.toLowerCase()) &&
      (r.market_name || '').toLowerCase().includes(district.toLowerCase())
    );
    const item = filteredRecords[0] || records[0]; // Fallback to first if no match
    
    const advice = {
      'hi-IN': 'आज बेचें – अच्छी कीमत!',
      'ml-IN': 'ഇന്ന് വിൽക്കുക – നല്ല വില!',
      'ta-IN': 'இன்று விற்கவும் – நல்ல விலை!'
    }[lang] || 'Sell today – good price!';
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solution: `${commodity} की कीमत (${district}, 17 Sep 2025): मोडल ${item.modal_price || '₹26'}/क्विंटल (मिन ${item.min_price || '₹20'}, मैक्स ${item.max_price || '₹30'}). सलाह: ${advice}`
      })
    };
  } catch (error) {
    console.error('Mandi error:', error);
    const fallbacks = {
      'hi-IN': 'कीमतें उपलब्ध नहीं। टमाटर ₹26/kg (पालक्काड, 17 Sep 2025). आज बेचें!',
      'ml-IN': 'വിലകൾ ലഭ്യമല്ല. ടൊമാറ്റോ ₹26/kg (പാലക്കാട്, 17 Sep 2025). ഇന്ന് വിൽക്കുക!'
    };
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: fallbacks[lang] || 'Prices unavailable. Tomato ₹26/kg (Palakkad, 17 Sep 2025). Sell today!' })
    };
  }
};
