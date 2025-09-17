exports.handler = async (event, context) => {
  try {
    const { query = '', lang = 'hi' } = event.queryStringParameters || {};
    const problems = {
      'पत्तियां पीली': { diagnosis: 'नाइट्रोजन की कमी', solution: 'यूरिया 25kg/एकड़ छिड़कें।' },
      'ഇലകൾ മഞ്ഞ': { diagnosis: 'നൈട്രജൻ കുറവ്', solution: 'യൂറിയ 25kg/ഏക്കർ തളിക്കുക.' },
      'இலைகள் மஞ்சள்': { diagnosis: 'நைட்ரஜன் குறைபாடு', solution: 'யூரியா 25kg/ஏக்கருக்கு.' },
      'ఆకులు పసుపు': { diagnosis: 'నైట్రోజన్ లోపం', solution: 'యూరియా 25kg/ఎకరానికి.' },
      'पाने पिवळी': { diagnosis: 'नायट्रोजनची कमतरता', solution: 'यूरिया 25kg/एकर.' },
      'પાંદડા પીળા': { diagnosis: 'નાઇટ્રોજનની ઉણપ', solution: 'યુરિયા 25kg/એકર.' },
      'yellow leaves': { diagnosis: 'Nitrogen deficiency', solution: 'Urea 25kg/acre.' },
      'बड रॉट': { diagnosis: 'नारियल बड रॉट', solution: 'बोर्डो मिश्रण 1% स्प्रे करें।' },
      'ബഡ് റോട്ട്': { diagnosis: 'നാളികേരത്തിൽ ബഡ് റോട്ട്', solution: 'ബോർഡോ മിശ്രിതം 1% സ്പ്രേ.' }
    };
    const key = Object.keys(problems).find(k => query.includes(k)) || 'general';
    const data = problems[key] || { 
      diagnosis: lang === 'hi-IN' ? 'सामान्य सलाह' : 'പൊതു ഉപദേശം', 
      solution: lang === 'hi-IN' ? 'मिट्टी जाँच करें।' : 'മണ്ണ് പരിശോധിക്കുക.' 
    };
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: `${data.diagnosis}: ${data.solution}` })
    };
  } catch (error) {
    console.error('Advice error:', error);
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: lang === 'hi-IN' ? 'सलाह उपलब्ध नहीं।' : 'ഉപദേശം ലഭ്യമല്ല.' }) 
    };
  }
};
