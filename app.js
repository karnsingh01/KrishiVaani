class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'ml-IN';
    this.agriculturalData = {
      cropProblems: {
        'ഇലകൾ മഞ്ഞ': { diagnosis: 'നൈട്രജൻ കുറവ്', solution: 'യൂറിയ 25kg/ഏക്കർ തളിക്കുക.' },
        'yellow leaves': { diagnosis: 'Nitrogen deficiency', solution: 'Urea 25kg/acre.' }
      }
    };
    this.schemes = [
      { name: "PM-KISAN", desc: "₹6000/വർഷം", link: "https://pmkisan.gov.in/" },
      { name: "Kudumbashree", desc: "കർഷക വായ്പകൾ", link: "https://www.kudumbashree.org/" }
    ];
    this.initApp();
  }

  initApp() {
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('appContent').style.display = 'block';
    }, 3000);

    const greetings = ['നമസ്കാരം, കൊച്ചി കർഷകേ!', 'ഹലോ, വയനാട് കർഷകാ!'];
    document.getElementById('greeting').textContent = greetings[Math.floor(Math.random() * greetings.length)];
    const tips = ['മഴക്കാലത്ത് നാളികേരം ബഡ് റോട്ട് പരിശോധിക്കുക.', 'Paddy irrigation: 5-7 days.'];
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
    mandiBtn.addEventListener('click', () => this.fetchMandiPrices(document.getElementById('mandiSearch').value || 'Tomato Palakkad'));

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
    if (!SpeechRecognition) return this.showError('ശബ്ദ സപ്പോർട്ട് ഇല്ല.');
    
    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.currentLang;
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.processQuery(transcript);
    };
    this.recognition.onerror = () => this.showError('ശബ്ദ പിശക്.');
    this.recognition.start();
  }

  processQuery(query) {
    const lowerQuery = query.toLowerCase();
    let response;
    if (lowerQuery.includes('കാലാവസ്ഥ') || lowerQuery.includes('weather')) {
      response = this.fetchWeather('Kochi');
    } else if (lowerQuery.includes('വില') || lowerQuery.includes('price')) {
      response = this.fetchMandiPrices('Tomato', 'Palakkad');
    } else {
      response = this.getAIResponse(lowerQuery);
    }
    this.showResponse(response);
    this.speakResponse(response);
  }

  async fetchWeather(city) {
    try {
      const res = await fetch(`/.netlify/functions/weather?city=${city}&lang=ml`);
      return await res.json();
    } catch (err) {
      return { solution: 'കാലാവസ്ഥ ലഭ്യമല്ല. ഫോൾബാക്ക്: 25-30°C, മഴ.' };
    }
  }

  async fetchMandiPrices(commodity, district) {
    try {
      const res = await fetch(`/.netlify/functions/mandi?commodity=${commodity}&district=${district}`);
      return await res.json();
    } catch (err) {
      return { solution: 'വിലകൾ ലഭ്യമല്ല. ഫോൾബാക്ക്: ടൊമാറ്റോ ₹26/kg പാലക്കാട്.' };
    }
  }

  getAIResponse(query) {
    for (const [key, data] of Object.entries(this.agriculturalData.cropProblems)) {
      if (query.includes(key)) return data;
    }
    return { diagnosis: 'പൊതു ഉപദേശം', solution: 'മണ്ണ് പരിശോധിക്കുക (Test soil).' };
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
      li.innerHTML = `<strong>${scheme.name}:</strong> ${scheme.desc} <a href="${scheme.link}" target="_blank">ആവേദനം</a>`;
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
