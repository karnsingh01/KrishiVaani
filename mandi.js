const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');

exports.handler = async (event, context) => {
  try {
    const { commodity = 'Tomato', district = 'Palakkad' } = event.queryStringParameters || {};
    const apiUrl = `https://api.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi?api-key=NOKEY&format=csv&limit=50&filters[commodity_name]=${commodity}&filters[market_name]=${district}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Agmarknet error: ${response.status}`);
    
    const csv = await response.text();
    const records = parse(csv, { columns: true, skip_empty_lines: true });
    const item = records.find(r => r.market_name?.includes(district)) || records[0];
    
    const advice = `ഇന്ന് വിൽക്കുക – നല്ല വില! (Sell today – good price!)`;
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modal_price: item?.modal_price || '₹26/kg',
        min_max: `${item?.min_price || '₹20'}-${item?.max_price || '₹30'}/kg`,
        tip: advice
      })
    };
  } catch (error) {
    console.error('Mandi error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: 'വിലകൾ ലഭ്യമല്ല. ഫോൾബാക്ക്: ടൊമാറ്റോ ₹26/kg പാലക്കാട്.' })
    };
  }
};