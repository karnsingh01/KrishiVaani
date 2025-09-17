class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'hi-IN'; // Default Hindi
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
    });

    weatherBtn.addEventListener('click', () => this.fetchWeather(document.getElementById('cityInput').value || 'Kochi'));
    mandiBtn.addEventListener('click', () => this.fetchMandiPrices(
      document.getElementById('commoditySelect').value || 'Tomato',
      document.getElementById('mandiSearch').value || 'Palakkad'
    ));

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelector('.nav-btn.active').classList.remove('active');
        e.target.classList.add('active');
        document.querySelectorAll('.section-card, .voice-card').forEach(sec => sec.classList.add('hidden'));
        document.getElementById(e.target.dataset.section + 'Section' || 'voice-card').classList.remove('hidden');
      });
    });
  }

  async startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return this.showError('आवाज़ समर्थन नहीं।');

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.currentLang;
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.processQuery(transcript);
    };
    this.recognition.onerror = () => this.showError('आवाज़ में त्रुटि।');
    this.recognition.start();
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
      const res = await fetch(`/.netlify/functions/weather?city=${city}&lang=${this.currentLang}`);
      return await res.json();
    } catch (err) {
      return { solution: this.currentLang === 'ml-IN' ? 'കാലാവസ്ഥ ലഭ്യമല്ല. 25-30°C, മഴ.' : 'मौसम उपलब्ध नहीं। 25-30°C, बारिश।' };
    }
  }

  async fetchMandiPrices(commodity, district) {
    try {
      const res = await fetch(`/.netlify/functions/mandi?commodity=${commodity}&district=${district}&lang=${this.currentLang}`);
      return await res.json();
    } catch (err) {
      return { solution: this.currentLang === 'ml-IN' ? 'വിലകൾ ലഭ്യമല്ല. ടൊമാറ്റോ ₹26/kg.' : 'कीमतें उपलब्ध नहीं। टमाटर ₹26/kg।' };
    }
  }

  async fetchAdvice(query) {
    try {
      const res = await fetch(`/.netlify/functions/advice?query=${encodeURIComponent(query)}&lang=${this.currentLang}`);
      return await res.json();
    } catch (err) {
      return { solution: this.currentLang === 'ml-IN' ? 'ഉപദേശം ലഭ്യമല്ല.' : 'सलाह उपलब्ध नहीं।' };
    }
  }

  speakResponse(response) {
    const utterance = new SpeechSynthesisUtterance(response.solution);
    utterance.lang = this.currentLang;
    this.synthesis.speak(utterance);
  }

  showResponse(response) {
    document.getElementById('responseContent').innerHTML = `<div class="solution">${response.solution}</div>`;
    document.getElementById('responseSection').classList.remove('hidden');
  }

  showError(message) {
    document.getElementById('responseContent').innerHTML = `<div class="error">${message}</div>`;
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

  checkSystemRequirements() {
    const micBtn = document.getElementById('micBtn');
    if (location.protocol === 'https:' || location.hostname === 'localhost') {
      micBtn.disabled = false;
    }
  }

  processTextInput() {
    const query = document.getElementById('textInput').value.trim();
    if (query) this.processQuery(query);
  }
}

document.addEventListener('DOMContentLoaded', () => new KisanVaaniApp());
