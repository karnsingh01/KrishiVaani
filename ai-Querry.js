exports.handler = async (event, context) => {
  try {
    const { query = '', lang = 'ml' } = event.queryStringParameters || {};
    const problems = {
      'ഇലകൾ മഞ്ഞ': { diagnosis: 'നൈട്രജൻ കുറവ്', solution: 'യൂറിയ 25kg/ഏക്കർ തളിക്കുക.' },
      'yellow leaves': { diagnosis: 'Nitrogen deficiency', solution: 'Urea 25kg/acre.' },
      'ബഡ് റോട്ട്': { diagnosis: 'നാളികേരത്തിൽ ബഡ് റോട്ട്', solution: 'ബോർഡോ മിശ്രിതം 1% സ്പ്രേ.' }
    };
    const key = Object.keys(problems).find(k => query.includes(k)) || 'general';
    const data = problems[key] || { diagnosis: 'പൊതു ഉപദേശം', solution: 'മണ്ണ് പരിശോധിക്കുക (Test soil).' };
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Advice error:', error);
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: 'ഉപദേശം ലഭ്യമല്ല. പിന്നീട് ശ്രമിക്കൂ.' }) 
    };
  }
};
