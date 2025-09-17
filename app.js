class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'hi-IN';
    this.permissionGranted = false;
    this.commodities = [
      { name: 'Tomato', hindi: 'टमाटर', malayalam: 'തക്കാളി' },
      { name: 'Onion', hindi: 'प्याज', malayalam: 'സവോള' },
      { name: 'Pineapple', hindi: 'अनानास', malayalam: 'കൈതച്ചക്ക' },
      { name: 'Banana', hindi: 'केला', malayalam: 'വാഴപ്പഴം' },
      { name: 'Mango', hindi: 'आम', malayalam: 'മാമ്പഴം' },
      { name: 'Potato', hindi: 'आलू', malayalam: 'ഉരുളക്കിഴങ്ങ്' },
      { name: 'Brinjal', hindi: 'बैंगन', malayalam: 'വഴുതന' },
      { name: 'Cabbage', hindi: 'पत्तागोभी', malayalam: 'മുട്ടക്കോസ്' },
      // Add more as needed
    ];
    this.agriculturalData = {
      cropProblems: {
        'पत्तियां पीली': { diagnosis: 'नाइट्रोजन की कमी', solution: 'यूरिया 25kg/एकड़ छिड़कें।' },
        'ഇലകൾ മഞ്ഞ': { diagnosis: 'നൈട്രജൻ കുറവ്', solution: 'യൂറിയ 25kg/ഏക്കർ തളിക്കുക.' },
        // ... (as before)
      }
    };
    this.schemes = [
      { name: 'PM-KISAN', desc: '₹6000/वर्ष छोटे किसानों को।', link: 'https://pmkisan.gov.in/' },
      // ... (as before)
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
    this.populateCommodities();
  }

  async checkSystemRequirements() {
    const micBtn = document.getElementById('micBtn');
    const status = document.getElementById('status');
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      status.textContent = 'HTTPS की ज़रूरत – Netlify पर डिप्लॉय करें।';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.getTracks().forEach(track => track.stop());
      this.permissionGranted = true;
      micBtn.disabled = false;
      status.textContent = 'AI माइक तैयार – बोलें!';
    } catch (err) {
      console.error('Mic permission error:', err);
      status.textContent = 'माइक परमिशन दें। AI टेक्स्ट से भी जवाब देगा।';
      micBtn.disabled = false; // Allow text fallback
    }
  }

  setupEventListeners() {
    // As before, but mic click now triggers AI processing
    const micBtn = document.getElementById('micBtn');
    micBtn.addEventListener('click', () => this.startVoiceInput());

    // ... (other listeners as before)
  }

  async startVoiceInput() {
    const status = document.getElementById('status');
    const micBtn = document.getElementById('micBtn');
    status.textContent = 'AI सुन रहा है... बोलें!';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.currentLang;
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        status.textContent = 'AI प्रोसेस कर रहा है...';
        micBtn.classList.add('listening');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        status.textContent = `AI ने सुना: ${transcript}`;
        this.processQuery(transcript); // AI call
      };

      this.recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        status.textContent = 'AI फेल – टेक्स्ट यूज़ करें।';
        this.processQuery(''); // Fallback to AI prompt
      };

      this.recognition.onend = () => {
        micBtn.classList.remove('listening');
      };

      try {
        this.recognition.start();
      } catch (err) {
        this.processQuery(''); // AI fallback
      }
    } else {
      status.textContent = 'AI माइक सपोर्ट नहीं – टेक्स्ट से पूछें।';
      this.processQuery(''); // AI fallback
    }
  }

  async processQuery(query) {
    const lowerQuery = query.toLowerCase();
    let response;

    // AI Call for All Queries (xAI API)
    try {
      const aiRes = await fetch(`/.netlify/functions/ai-query?query=${encodeURIComponent(query)}&lang=${this.currentLang}`);
      if (aiRes.ok) {
        response = await aiRes.json();
      } else {
        throw new Error('AI त्रुटि');
      }
    } catch (err) {
      console.error('AI query error:', err);
      response = { solution: 'AI जवाब उपलब्ध नहीं। कृपया दोबारा पूछें।' };
    }

    this.showResponse(response);
    this.speakResponse(response);
  }

  // Other methods (fetchWeather, fetchMandiPrices, etc.) now redirect to AI-query function
  async fetchWeather(city) {
    return await this.processQuery(`${city} का मौसम बताओ`);
  }

  async fetchMandiPrices(commodity, district) {
    return await this.processQuery(`${commodity} की कीमत ${district} में बताओ`);
  }

  // ... (other methods as before)
}

document.addEventListener('DOMContentLoaded', () => new KisanVaaniApp());
