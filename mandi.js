const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { commodity = 'Tomato', district = 'Palakkad', lang = 'hi-IN' } = event.queryStringParameters || {};
    // Official data.gov.in JSON endpoint (no filters for broad access)
    const apiUrl = `https://api.data.gov.in/resource/current-daily-price-various-commod
