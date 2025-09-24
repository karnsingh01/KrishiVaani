const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { image, lang = 'hi-IN' } = JSON.parse(event.body || '{}');
    // Mock analysis (replace with xAI API call for image: https://x.ai/api)
    const diagnosis = 'पत्तियों में पीला धब्बा - फंगल संक्रमण';
    const solution = 'बोर्डो मिश्रण 1% स्प्रे करें।';

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ diagnosis, solution })
    };
  } catch (error) {
    console.error('Crop Analyze error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ solution: 'विश्लेषण विफल। फोटो दोबारा लें।' })
    };
  }
};
