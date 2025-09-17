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
    ];
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
      { name: 'PM-KISAN', desc: '₹6000/वर्ष छोटे किसानों को।', link: 'https://pmkisan.gov.in/' },
      { name: 'कुदुंबश्री', desc: 'केरल में किसान लोन।', link: 'https://www.kudumbashree.org/' },
      { name: 'PMFBY', desc: 'फसल बीमा योजना।', link: 'https://pmfby.gov.in/' }
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
      status.textContent = 'माइक तैयार – बोलें!';
    } catch (err) {
      console.error('Mic permission error:', err);
      status.textContent = 'माइक परमिशन दें (ब्राउज़र सेटिंग्स में Allow करें)।';
      micBtn.disabled = false; // Allow retry
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      status.textContent += ' ब्राउज़र में माइक सपोर्ट नहीं – फिर भी AI जवाब देगा।';
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
      document.getElementById('status').textContent = `भाषा बदली: ${e.target.options[e.target.selectedIndex].text} – माइक दबाएँ।`;
      this.populateCommodities();
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
      if (!this.permissionGranted && !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        status.textContent = 'माइक सपोर्ट नहीं – टेक्स्ट यूज़ करें या Chrome/Edge लें।';
        return;
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.currentLang;
      this.recognition.continuous = false;
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
        // Fallback to text-like processing
        this.processQuery('');
      };

      this.recognition.onend = () => {
        micBtn.classList.remove('listening');
        status.textContent = 'माइक बंद – अगला सवाल पूछें।';
      };

      try {
        this.recognition.start();
      } catch (err) {
        this.showError('माइक स्टार्ट नहीं हो सका: ' + err.message);
        this.processQuery(''); // Fallback
      }
    } else {
      this.showError('माइक सपोर्ट नहीं – टेक्स्ट यूज़ करें।');
      this.processQuery(''); // Fallback to AI processing
    }
  }

  async processQuery(query) {
    const lowerQuery = query.toLowerCase();
    let response;

    // AI Fallback for empty or failed mic input
    if (!query) {
      response = { solution: this.currentLang === 'ml-IN' ? 'നിന്റെ ചോദ്യം വ്യക്തമല്ല. ദയവായി വീണ്ടും പറയുക!' : 'आपका सवाल स्पष्ट नहीं। कृपया दोबारा बोलें!' };
    } else if (lowerQuery.includes('मौसम') || lowerQuery.includes('weather') || lowerQuery.includes('കാലാവസ്ഥ') || lowerQuery.includes('வானிலை')) {
      const city = lowerQuery.includes('kochi') || lowerQuery.includes('കൊച്ചി') ? 'Kochi' : 'Kochi';
      response = await this.fetchWeather(city);
    } else if (lowerQuery.includes('कीमत') || lowerQuery.includes('price') || lowerQuery.includes('വില') || lowerQuery.includes('விலை')) {
      const commodityMatch = this.commodities.find(c => 
        lowerQuery.includes(c.hindi.toLowerCase()) || 
        lowerQuery.includes(c.malayalam.toLowerCase()) || 
        lowerQuery.includes(c.name.toLowerCase())
      );
      const commodity = commodityMatch ? commodityMatch.name : 'Tomato';
      const district = lowerQuery.includes('palakkad') || lowerQuery.includes('പാലക്കാട്') ? 'Palakkad' : 'Palakkad';
      response = await this.fetchMandiPrices(commodity, district);
    } else if (lowerQuery.includes('योजना') || lowerQuery.includes('scheme') || lowerQuery.includes('പദ്ധതി')) {
      response = { solution: 'PM-KISAN: ₹6000/वर्ष। लिंक: pmkisan.gov.in' };
    } else {
      response = this.getAIResponse(lowerQuery);
    }
    this.showResponse(response);
    this.speakResponse(response);
  }

  getAIResponse(query) {
    const lowerQuery = query.toLowerCase();
    for (const [key, data] of Object.entries(this.agriculturalData.cropProblems)) {
      if (lowerQuery.includes(key.toLowerCase())) {
        return { solution: `${data.diagnosis}: ${data.solution}` };
      }
    }
    return { solution: this.currentLang === 'ml-IN' ? 'നിന്റെ ചോദ്യം വ്യക്തമല്ല. ദയവായി വീണ്ടും പറയുക!' : 'आपका सवाल स्पष्ट नहीं। कृपया दोबारा बोलें!' };
  }

  async fetchWeather(city) {
    try {
      const res = await fetch(`/.netlify/functions/weather?city=${city}&lang=${this.currentLang}`);
      if (!res.ok) throw new Error('Backend त्रुटि');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Weather fetch error:', err);
      const apiKey = 'b1b15e88fa797225412429c1c50c122a1';
      const owmRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric&lang=hi`);
      if (owmRes.ok) {
        const owmData = await owmRes.json();
        const temp = Math.round(owmData.main.temp);
        const desc = owmData.weather[0].description;
        const humidity = owmData.main.humidity;
        const advice = this.currentLang === 'ml-IN' ? 'മഴയ്ക്ക് ശേഷം ജലസേചനം വൈകിപ്പിക്കുക।' : 'बारिश के बाद सिंचाई टालें।';
        return { solution: `${city} मौसम (18 Sep 2025): ${temp}°C, ${desc}। नमी: ${humidity}%. सलाह: ${advice}` };
      }
      return { solution: this.currentLang === 'ml-IN' ? 'കാലാവസ്ഥ ലഭ്യമല്ല. 25-30°C, മഴ (18 Sep 2025). ജലസേചനം വൈകിപ്പിക്കുക।' : 'मौसम डेटा उपलब्ध नहीं। फॉलबैक: कोच्चि 25-30°C, हल्की बारिश।' };
    }
  }

  async fetchMandiPrices(commodity, district) {
    try {
      const res = await fetch(`/.netlify/functions/mandi?commodity=${encodeURIComponent(commodity)}&district=${encodeURIComponent(district)}&lang=${this.currentLang}`);
      if (res.ok) {
        const data = await res.json();
        document.getElementById('mandiOutput').innerHTML = `<div class="solution">${data.solution}</div>`;
        return data;
      }
    } catch (backendErr) {
      console.error('Backend Mandi error:', backendErr);
    }

    try {
      const apiUrl = `https://api.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi?api-key=NOKEY&format=json&limit=50`;
      const directRes = await fetch(apiUrl);
      if (directRes.ok) {
        const directData = await directRes.json();
        const item = directData.records.find(r => 
          r.commodity_name.toLowerCase() === commodity.toLowerCase() && 
          r.market_name.toLowerCase().includes(district.toLowerCase())
        ) || directData.records.find(r => r.commodity_name.toLowerCase() === commodity.toLowerCase()) || directData.records[0];
        const modalPrice = item.modal_price || '26';
        const minPrice = item.min_price || '22';
        const maxPrice = item.max_price || '30';
        const advice = this.currentLang === 'ml-IN' ? 'ഇന്ന് വിൽക്കുക – നല്ല വില!' : 'आज बेचें – अच्छी कीमत!';
        const solution = `${commodity} की कीमत (${district}, 18 Sep 2025): मोडल ₹${modalPrice}/kg (मिन ₹${minPrice}, मैक्स ₹${maxPrice})। सलाह: ${advice}`;
        document.getElementById('mandiOutput').innerHTML = `<div class="solution">${solution}</div>`;
        return { solution };
      }
    } catch (directErr) {
      console.error('Direct Mandi error:', directErr);
    }

    const fallbackPrices = {
      Tomato: 26, Onion: 12, Pineapple: 40, Banana: 30, Mango: 50, Potato: 15, Brinjal: 20, Cabbage: 18
    };
    const modalPrice = fallbackPrices[commodity] || 26;
    const solution = this.currentLang === 'ml-IN' 
      ? `വിലകൾ ലഭ്യമല്ല. ${commodity} ₹${modalPrice}/kg (${district}, 18 Sep 2025). ഇന്ന് വിൽക്കുക!`
      : `मंडी डेटा उपलब्ध नहीं। ${commodity} ₹${modalPrice}/kg (${district}, 18 Sep 2025)। आज बेचें!`;
    document.getElementById('mandiOutput').innerHTML = `<div class="solution">${solution}</div>`;
    return { solution };
  }

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

  populateCommodities() {
    const select = document.getElementById('commoditySelect');
    select.innerHTML = '';
    const labelKey = this.currentLang === 'ml-IN' ? 'malayalam' : 'hindi';
    this.commodities.forEach(commodity => {
      const option = document.createElement('option');
      option.value = commodity.name;
      option.textContent = commodity[labelKey];
      select.appendChild(option);
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
