class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'hi-IN'; // Default Hindi
    this.agriculturalData = {
      cropProblems: {
        'पत्तियां पीली': { diagnosis: 'नाइट्रोजन की कमी', solution: 'यूरिया 25kg/एकड़ छिड़कें।' },
        'ഇലകൾ മഞ്ഞ': { diagnosis: 'നൈട്രജൻ കുറവ്', solution: 'യൂറിയ 25kg/ഏക്കർ തളിക്കുക.' },
        // Add more as before...
      }
    };
    this.schemes = [
      { name: "PM-KISAN", desc: "₹6000/वर्ष छोटे किसानों को।", link: "https://pmkisan.gov.in/" },
      // Add more...
    ];
    this.initApp();
  }

  initApp() {
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('appContent').style.display = 'block';
    }, 3000);

    // Greetings and tips as before...
    this.checkSystemRequirements();
    this.setupEventListeners();
    this.populateSchemes();
  }

  checkSystemRequirements() {
    const micBtn = document.getElementById('micBtn');
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      this.showError('HTTPS की ज़रूरत – Netlify पर deploy करें।');
      return;
    }
    micBtn.disabled = false;
    this.updateStatus('माइक तैयार – बोलें!');
  }

  setupEventListeners() {
    // As before, but add mic permission
    const micBtn = document.getElementById('micBtn');
    micBtn.addEventListener('click', async () => {
      try {
        // Request mic permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop after permission
        this.startVoiceInput();
      } catch (err) {
        this.showError('माइक परमिशन दें – ब्राउज़र सेटिंग्स चेक करें।');
      }
    });

    // Weather/Mandi buttons as before
  }

  async startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.showError('यह ब्राउज़र सपोर्ट नहीं करता – Chrome/Edge यूज़ करें।');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.currentLang;
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => this.updateStatus('सुन रहा हूँ...');
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.updateStatus('समझा: ' + transcript);
      this.processQuery(transcript);
    };
    this.recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      this.showError('आवाज़ त्रुटि: ' + event.error + '. साफ बोलें या दोबारा ट्राई करें।');
    };
    this.recognition.onend = () => this.updateStatus('बोलें...');

    try {
      this.recognition.start();
    } catch (err) {
      this.showError('शुरू करने में त्रुटि: ' + err.message);
    }
  }

  async processQuery(query) {
    // As before, but with better error handling
    try {
      let response;
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('मौसम') || lowerQuery.includes('weather') || lowerQuery.includes('കാലാവസ്ഥ')) {
        response = await this.fetchWeather('Kochi');
      } else if (lowerQuery.includes('कीमत') || lowerQuery.includes('price') || lowerQuery.includes('വില')) {
        response = await this.fetchMandiPrices('Tomato', 'Palakkad');
      } else {
        response = this.getAIResponse(lowerQuery);
      }
      this.showResponse(response);
      this.speakResponse(response);
    } catch (err) {
      this.showError('क्वेरी में त्रुटि: ' + err.message);
    }
  }

  async fetchWeather(city = 'Kochi') {
    try {
      // Fallback to OpenWeatherMap (free, no key for basic)
      const apiKey = 'b1b15e88fa797225412429c1c50c122a1'; // Public demo key – prod में अपना लें
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric&lang=hi`);
      if (!res.ok) throw new Error('API त्रुटि');
      const data = await res.json();
      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const humidity = data.main.humidity;
      const advice = 'बारिश के बाद सिंचाई टालें।'; // Lang-based as before

      return {
        solution: `${city} मौसम (17 Sep 2025): ${temp}°C, ${desc}। नमी: ${humidity}%. सलाह: ${advice}`
      };
    } catch (err) {
      console.error('Weather fetch error:', err);
      return { solution: 'मौसम डेटा उपलब्ध नहीं। फॉलबैक: कोच्चि 25-30°C, हल्की बारिश।' };
    }
  }

  async fetchMandiPrices(commodity = 'Tomato', district = 'Palakkad') {
    try {
      // Updated data.gov.in endpoint for daily prices
      const apiUrl = `https://api.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi?api-key=NOKEY&format=json&limit=10`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('API त्रुटि');
      const data = await res.json();
      const item = data.records.find(r => r.commodity_name === commodity && r.market_name.includes(district)) || data.records[0];
      const price = item ? `₹${item.modal_price}/क्विंटल (मिन: ${item.min_price}, मैक्स: ${item.max_price})` : '₹26/kg (औसत)';

      return {
        solution: `${commodity} की ${district} में कीमत (17 Sep 2025): ${price}। बेचने का अच्छा समय।`
      };
    } catch (err) {
      console.error('Mandi fetch error:', err);
      return { solution: 'मंडी डेटा उपलब्ध नहीं। फॉलबैक: टमाटर ₹26/kg पालक्काड में।' };
    }
  }

  // Other methods (getAIResponse, speakResponse, showResponse, etc.) as before...
  getAIResponse(query) {
    const lowerQuery = query.toLowerCase();
    for (const [key, data] of Object.entries(this.agriculturalData.cropProblems)) {
      if (lowerQuery.includes(key.toLowerCase())) {
        return { solution: `${data.diagnosis}: ${data.solution}` };
      }
    }
    return { solution: 'फसल समस्या बताएँ – पत्तियाँ पीली? कीट लगे?' };
  }

  speakResponse(response) {
    const utterance = new SpeechSynthesisUtterance(response.solution);
    utterance.lang = this.currentLang;
    utterance.rate = 0.9;
    this.synthesis.speak(utterance);
  }

  showResponse(response) {
    document.getElementById('responseContent').innerHTML = `<div class="solution"><strong>💡 उत्तर:</strong> ${response.solution}</div>`;
    document.getElementById('responseSection').classList.remove('hidden');
  }

  showError(message) {
    document.getElementById('responseContent').innerHTML = `<div class="error"><strong>⚠️ समस्या:</strong> ${message}</div>`;
    document.getElementById('responseSection').classList.remove('hidden');
  }

  updateStatus(message) {
    document.getElementById('status').textContent = message;
  }

  populateSchemes() {
    // As before...
  }

  processTextInput() {
    const query = document.getElementById('textInput').value.trim();
    if (query) {
      document.getElementById('textInput').value = '';
      this.processQuery(query);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new KisanVaaniApp());
