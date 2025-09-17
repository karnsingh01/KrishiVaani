class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'hi-IN'; // Default Hindi
    this.permissionGranted = false;
    this.agriculturalData = {
      cropProblems: {
        'पत्तियां पीली': { diagnosis: 'नाइट्रोजन की कमी', solution: 'यूरिया 25kg/एकड़ छिड़कें।' },
        'ഇലകൾ മഞ്ഞ': { diagnosis: 'നൈട്രജൻ കുറവ്', solution: 'യൂറിയ 25kg/ഏക്കർ തളിക്കുക.' },
        'இலைகள் மஞ்சள்': { diagnosis: 'நைட்ரஜன் குறைபாடு', solution: 'யூரியா 25kg/ஏக்கருக்கு.' },
        'ఆకులు పసుపు': { diagnosis: 'నైట్రోజన్ లోపం', solution: 'యూరియా 25kg/ఎకరానికి.' },
        'पाने पिवळी': { diagnosis: 'नायट्रोजनची कमतरता', solution: 'यूरिया 25kg/एकर.' },
        'પાંદડા પીળા': { diagnosis: 'નાઇટ્રોજનની ઉણપ', solution: 'યુરિયા 25kg/એકર.' },
        'yellow leaves': { diagnosis: 'Nitrogen deficiency', solution: 'Urea 25kg/acre.' },
        'बड रॉट': { diagnosis: 'नारियल बड रॉट', solution: 'बोर्डो मिश्रण 1% स्प्रे करें।' },
        'ബഡ് റോട്ട്': { diagnosis: 'നാളികേരത്തിൽ ബഡ് റോട്ട്', solution: 'ബോർഡോ മിശ്രിതം 1% സ്പ്രേ.' }
      }
    };
    this.schemes = [
      { name: "PM-KISAN", desc: "₹6000/वर्ष छोटे किसानों को।", link: "https://pmkisan.gov.in/" },
      { name: "कुदुंबश्री", desc: "केरल में किसान लोन।", link: "https://www.kudumbashree.org/" },
      { name: "PMFBY", desc: "फसल बीमा योजना।", link: "https://pmfby.gov.in/" }
    ];
    this.initApp();
  }

  initApp() {
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('appContent').style.display = 'block';
    }, 3000);

    const greetings = ['नमस्ते, कोच्चि के किसान!', 'हाय, पालक्काड किसान!'];
    document.getElementById('greeting').textContent = greetings[Math.floor(Math.random() * greetings.length)];
    const tips = ['मॉनसून में धान की सिंचाई 5-7 दिन में करें।', 'नारियल में बड रॉट के लिए बोर्डो स्प्रे करें।'];
    document.getElementById('dailyTip').textContent = tips[Math.floor(Math.random() * tips.length)];

    this.checkSystemRequirements();
    this.setupEventListeners();
    this.populateSchemes();
  }

  async checkSystemRequirements() {
    const micBtn = document.getElementById('micBtn');
    const status = document.getElementById('status');
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      status.textContent = 'HTTPS की ज़रूरत – Netlify पर डिप्लॉय करें।';
      return;
    }

    try {
      // Explicit Mic Permission for Speech API
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.getTracks().forEach(track => track.stop());
      this.permissionGranted = true;
      micBtn.disabled = false;
      status.textContent = 'माइक तैयार – बोलें!';
    } catch (err) {
      console.error('Mic permission error:', err);
      status.textContent = 'माइक परमिशन दें (ब्राउज़र सेटिंग्स में Allow करें)।';
      micBtn.disabled = true;
    }

    // Check Speech API Support
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      status.textContent += ' ब्राउज़र सपोर्ट नहीं (Chrome/Edge यूज़ करें)।';
    }
  }

  setupEventListeners() {
    const micBtn = document.getElementById('micBtn');
    const sendBtn = document.getElementById('sendBtn');
    const textInput = document.getElementById('textInput');
    const langSelect = document.getElementById('langSelect');
    const weatherBtn = document.getElementById('weatherBtn');
    const mandiBtn = document.getElementById('mandiBtn');

    micBtn.addEventListener('click', () => this.startVoiceInput());
    sendBtn.addEventListener('click', () => this.processTextInput());
    textInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.processTextInput(); });

    langSelect.addEventListener('change', (e) => {
      this.currentLang = e.target.value;
      document.getElementById('status').textContent = `भाषा बदली: ${e.target.options[e.target.selectedIndex].text} – दोबारा माइक दबाएँ।`;
    });

    weatherBtn.addEventListener('click', () => {
      const city = document.getElementById('cityInput').value || 'Kochi';
      this.fetchWeather(city).then(response => {
        document.getElementById('weatherOutput').innerHTML = `<div class="solution">${response.solution}</div>`;
      }).catch(err => this.showError('मौसम लोड त्रुटि: ' + err.message));
    });

    mandiBtn.addEventListener('click', () => {
      const commodity = document.getElementById('commoditySelect').value || 'Tomato';
      const district = document.getElementById('mandiSearch').value || 'Palakkad';
      this.fetchMandiPrices(commodity, district).then(response => {
        document.getElementById('mandiOutput').innerHTML = `<div class="solution">${response.solution}</div>`;
      }).catch(err => this.showError('मंडी लोड त्रुटि: ' + err.message));
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelector('.nav-btn.active').classList.remove('active');
        e.target.classList.add('active');
        document.querySelectorAll('.section-card, .voice-card').forEach(sec => sec.classList.add('hidden'));
        const sectionId = e.target.dataset.section === 'home' ? 'voice-card' : e.target.dataset.section + 'Section';
        document.getElementById(sectionId).classList.remove('hidden');
      });
    });
  }

  async startVoiceInput() {
    const status = document.getElementById('status');
    const micBtn = document.getElementById('micBtn');
    status.textContent = 'माइक स्टार्ट... बोलें!';

    if (!this.permissionGranted) {
      await this.checkSystemRequirements();
      if (!this.permissionGranted) return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.showError('आवाज़ API सपोर्ट नहीं – Chrome/Edge यूज़ करें।');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.currentLang;
    this.recognition.continuous = false; // Fix for short queries
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      status.textContent = 'सुन रहा हूँ... बोलें!';
      micBtn.classList.add('listening');
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      status.textContent = `सुना: ${transcript}`;
      this.processQuery(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      let errorMsg = 'आवाज़ त्रुटि: ';
      switch (event.error) {
        case 'not-allowed': errorMsg += 'परमिशन न दें – Allow करें।'; break;
        case 'no-speech': errorMsg += 'कुछ नहीं सुना – साफ बोलें।'; break;
        case 'audio-capture': errorMsg += 'माइक समस्या – चेक करें।'; break;
        case 'network': errorMsg += 'इंटरनेट चेक करें।'; break;
        default: errorMsg += 'दोबारा कोशिश करें।';
      }
      this.showError(errorMsg);
      status.textContent = 'माइक रेडी – दोबारा दबाएँ।';
      micBtn.classList.remove('listening');
    };

    this.recognition.onend = () => {
      micBtn.classList.remove('listening');
      status.textContent = 'माइक बंद – अगला सवाल पूछें।';
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.showError('माइक स्टार्ट नहीं हो सका: ' + err.message);
    }
  }

  async processQuery(query) {
    const lowerQuery = query.toLowerCase();
    let response;
    if (lowerQuery.includes('मौसम') || lowerQuery.includes('weather') || lowerQuery.includes('കാലാവസ്ഥ') || lowerQuery.includes('வானிலை')) {
      const city = lowerQuery.includes('kochi') || lowerQuery.includes('കൊച്ചി') ? 'Kochi' : 'Kochi';
      response = await this.fetchWeather(city);
    } else if (lowerQuery.includes('कीमत') || lowerQuery.includes('price') || lowerQuery.includes('വില') || lowerQuery.includes('விலை')) {
      const commodity = lowerQuery.includes('tomato') || lowerQuery.includes('ടൊമാറ്റോ') ? 'Tomato' : 'Tomato';
      response = await this.fetchMandiPrices(commodity, 'Palakkad');
    } else if (lowerQuery.includes('योजना') || lowerQuery.includes('scheme') || lowerQuery.includes('പദ്ധതി')) {
      response = { solution: 'PM-KISAN: ₹6000/वर्ष। लिंक: pmkisan.gov.in' };
    } else {
      response = await this.fetchAdvice(lowerQuery);
    }
    this.showResponse(response);
    this.speakResponse(response);
  }

  async fetchWeather(city) {
    try {
      // IMD Backend Call (Fixed URL from PDF)
      const res = await fetch(`/.netlify/functions/weather?city=${city}&lang=${this.currentLang}`);
      if (!res.ok) throw new Error('Backend त्रुटि');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Weather fetch error:', err);
      // Fallback Direct OpenWeatherMap (Free, No Backend Needed)
      const apiKey = 'b1b15e88fa797225412429c1c50c122a1'; // Demo key – prod में अपना लें
      const owmRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric&lang=hi`);
      if (owmRes.ok) {
        const owmData = await owmRes.json();
        const temp = Math.round(owmData.main.temp);
        const desc = owmData.weather[0].description;
        const humidity = owmData.main.humidity;
        const advice = 'बारिश के बाद सिंचाई टालें।';
        return { solution: `${city} मौसम (18 Sep 2025): ${temp}°C, ${desc}। नमी: ${humidity}%. सलाह: ${advice}` };
      }
      return { solution: 'मौसम डेटा उपलब्ध नहीं। फॉलबैक: कोच्चि 25-30°C, हल्की बारिश।' };
    }
  }

  async fetchMandiPrices(commodity, district) {
    try {
      // Backend Call (Fixed JSON)
      const res = await fetch(`/.netlify/functions/mandi?commodity=${commodity}&district=${district}&lang=${this.currentLang}`);
      if (!res.ok) throw new Error('Backend त्रुटि');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Mandi fetch error:', err);
      // Fallback Direct data.gov.in JSON
      const apiUrl = `https://api.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi?api-key=NOKEY&format=json&limit=10`;
      const directRes = await fetch(apiUrl);
      if (directRes.ok) {
        const directData = await directRes.json();
        const item = directData.records.find(r => r.commodity_name === commodity && r.market_name.includes(district)) || directData.records[0];
        const price = item ? `₹${item.modal_price}/क्विंटल (मिन ${item.min_price}, मैक्स ${item.max_price})` : '₹26/kg (औसत)';
        return { solution: `${commodity} की ${district} में कीमत (18 Sep 2025): ${price}। बेचने का अच्छा समय।` };
      }
      return { solution: 'मंडी डेटा उपलब्ध नहीं। फॉलबैक: टमाटर ₹26/kg पालक्काड में।' };
    }
  }

  async fetchAdvice(query) {
    try {
      const res = await fetch(`/.netlify/functions/advice?query=${encodeURIComponent(query)}&lang=${this.currentLang}`);
      if (!res.ok) throw new Error('Backend त्रुटि');
      return await res.json();
    } catch (err) {
      console.error('Advice fetch error:', err);
      const fallback = this.currentLang === 'ml-IN' ? 'ഉപദേശം: മണ്ണ് പരിശോധിക്കുക.' : 'सलाह: मिट्टी जाँच करें।';
      return { solution: fallback };
    }
  }

  // Other methods (speakResponse, showResponse, etc.) as before...
  speakResponse(response) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response.solution);
      utterance.lang = this.currentLang;
      utterance.rate = 0.9;
      this.synthesis.speak(utterance);
    }
  }

  showResponse(response) {
    document.getElementById('responseContent').innerHTML = `<div class="solution"><strong>🔍 उत्तर:</strong> ${response.solution}</div>`;
    document.getElementById('responseSection').classList.remove('hidden');
  }

  showError(message) {
    document.getElementById('responseContent').innerHTML = `<div class="error"><strong>⚠️ त्रुटि:</strong> ${message}</div>`;
    document.getElementById('responseSection').classList.remove('hidden');
  }

  populateSchemes() {
    const list = document.getElementById('schemesList');
    this.schemes.forEach(scheme => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${scheme.name}:</strong> ${scheme.desc} <a href="${scheme.link}" target="_blank">आवेदन करें</a>`;
      list.appendChild(li);
    });
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
