class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'hi-IN';
    this.commodities = [
      { name: 'Tomato', hindi: 'टमाटर', malayalam: 'തക്കാളി' },
      { name: 'Onion', hindi: 'प्याज', malayalam: 'സവോള' },
      { name: 'Banana', hindi: 'केला', malayalam: 'വാഴപ്പഴം' },
      { name: 'Mango', hindi: 'आम', malayalam: 'മാമ്പഴം' },
      { name: 'Potato', hindi: 'आलू', malayalam: 'ഉരുളക്കിഴങ്ങ്' },
      { name: 'Brinjal', hindi: 'बैंगन', malayalam: 'വഴുതന' },
      { name: 'Cabbage', hindi: 'पत्तागोभी', malayalam: 'മുട്ടക്കോസ്' },
    ];
    this.initApp();
  }

  initApp() {
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('appContent').style.display = 'block';
    }, 2000);

    const greetings = ['नमस्ते, कोच्चि के किसान!', 'हाय, पालक्काड किसान!'];
    document.getElementById('greeting').textContent = greetings[Math.floor(Math.random() * greetings.length)];
    const tips = ['मॉनसून में धान की सिंचाई 5-7 दिन में करें।', 'नारियल में बड रॉट के लिए बोर्डो स्प्रे करें।'];
    document.getElementById('dailyTip').textContent = tips[Math.floor(Math.random() * tips.length)];

    this.checkMic();
    this.setupEventListeners();
    this.populateCommodities();
  }

  async checkMic() {
    const micBtn = document.getElementById('micBtn');
    const status = document.getElementById('status');
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      status.textContent = 'HTTPS की ज़रूरत – Netlify पर डिप्लॉय करें।';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      micBtn.disabled = false;
      status.textContent = 'AI माइक तैयार – बोलें!';
    } catch (err) {
      console.error('Mic error:', err);
      status.textContent = 'माइक परमिशन दें। AI टेक्स्ट से जवाब देगा।';
      micBtn.disabled = false;
    }
  }

  setupEventListeners() {
    const micBtn = document.getElementById('micBtn');
    const sendBtn = document.getElementById('sendBtn');
    const textInput = document.getElementById('textInput');
    const langSelect = document.getElementById('langSelect');
    const weatherBtn = document.getElementById('weatherBtn');
    const mandiBtn = document.getElementById('mandiBtn');
    const schemesBtn = document.getElementById('schemesBtn');
    const pestBtn = document.getElementById('pestBtn');
    const soilBtn = document.getElementById('soilBtn');

    micBtn.addEventListener('click', () => this.startVoiceInput());
    sendBtn.addEventListener('click', () => this.processTextInput());
    textInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.processTextInput(); });

    langSelect.addEventListener('change', (e) => {
      this.currentLang = e.target.value;
      document.getElementById('status').textContent = `भाषा बदली: ${e.target.options[e.target.selectedIndex].text}`;
      this.populateCommodities();
    });

    weatherBtn.addEventListener('click', () => {
      const city = document.getElementById('cityInput').value || 'Kochi';
      this.processQuery(`मौसम ${city} में`);
      document.getElementById('weatherOutput').innerHTML = '<div class="solution">AI जवाब लोड हो रहा है...</div>';
    });

    mandiBtn.addEventListener('click', () => {
      const commodity = document.getElementById('commoditySelect').value || 'Tomato';
      const district = document.getElementById('mandiSearch').value || 'Palakkad';
      this.processQuery(`${commodity} की कीमत ${district} में`);
      document.getElementById('mandiOutput').innerHTML = '<div class="solution">AI जवाब लोड हो रहा है...</div>';
    });

    schemesBtn.addEventListener('click', () => {
      const scheme = document.getElementById('schemeInput').value || 'PM-KISAN';
      this.processQuery(`${scheme} योजना की जानकारी`);
      document.getElementById('schemesOutput').innerHTML = '<div class="solution">AI जवाब लोड हो रहा है...</div>';
    });

    pestBtn.addEventListener('click', () => {
      const issue = document.getElementById('pestInput').value || 'पत्तियां पीली';
      this.processQuery(`फसल समस्या: ${issue}`);
      document.getElementById('pestOutput').innerHTML = '<div class="solution">AI जवाब लोड हो रहा है...</div>';
    });

    soilBtn.addEventListener('click', () => {
      const soil = document.getElementById('soilInput').value || 'लेटराइट मिट्टी धान';
      this.processQuery(`मिट्टी: ${soil}`);
      document.getElementById('soilOutput').innerHTML = '<div class="solution">AI जवाब लोड हो रहा है...</div>';
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
    status.textContent = 'AI सुन रहा है...';

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
        this.processQuery(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        status.textContent = 'माइक त्रुटि – टेक्स्ट यूज़ करें।';
        this.processQuery(''); // AI fallback
      };

      this.recognition.onend = () => {
        micBtn.classList.remove('listening');
        status.textContent = 'AI तैयार – दोबारा बोलें!';
      };

      try {
        this.recognition.start();
      } catch (err) {
        status.textContent = 'माइक शुरू नहीं हुआ – टेक्स्ट यूज़ करें।';
        this.processQuery('');
      }
    } else {
      status.textContent = 'माइक सपोर्ट नहीं – AI टेक्स्ट से जवाब देगा।';
      this.processQuery('');
    }
  }

  async processQuery(query) {
    const status = document.getElementById('status');
    if (!query) {
      status.textContent = 'कृपया सवाल टाइप करें या साफ बोलें।';
      return;
    }

    try {
      const aiRes = await fetch(`/.netlify/functions/ai-query?query=${encodeURIComponent(query)}&lang=${this.currentLang}`);
      if (!aiRes.ok) throw new Error('AI त्रुटि');
      const response = await aiRes.json();
      this.showResponse(response);
      this.speakResponse(response);

      // Update relevant section
      if (query.includes('मौसम') || query.includes('weather') || query.includes('കാലാവസ്ഥ')) {
        document.getElementById('weatherOutput').innerHTML = `<div class="solution">${response.solution}</div>`;
      } else if (query.includes('कीमत') || query.includes('price') || query.includes('വില')) {
        document.getElementById('mandiOutput').innerHTML = `<div class="solution">${response.solution}</div>`;
      } else if (query.includes('योजना') || query.includes('scheme') || query.includes('പദ്ധതി')) {
        document.getElementById('schemesOutput').innerHTML = `<div class="solution">${response.solution}</div>`;
      } else if (query.includes('फसल') || query.includes('कीट') || query.includes('രോഗം')) {
        document.getElementById('pestOutput').innerHTML = `<div class="solution">${response.solution}</div>`;
      } else if (query.includes('मिट्टी') || query.includes('soil') || query.includes('മണ്ണ്')) {
        document.getElementById('soilOutput').innerHTML = `<div class="solution">${response.solution}</div>`;
      }
    } catch (err) {
      console.error('AI query error:', err);
      const fallback = this.currentLang === 'ml-IN' ? 'AI ഉത്തരം ലഭ്യമല്ല। വീണ്ടും ശ്രമിക്കുക!' : 'AI जवाब उपलब्ध नहीं। दोबारा कोशिश करें!';
      this.showResponse({ solution: fallback });
    }
  }

  showResponse(response) {
    document.getElementById('responseContent').innerHTML = `<div class="solution"><strong>🔍 AI उत्तर:</strong> ${response.solution}</div>`;
    document.getElementById('responseSection').classList.remove('hidden');
  }

  speakResponse(response) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response.solution);
      utterance.lang = this.currentLang;
      utterance.rate = 0.9;
      this.synthesis.speak(utterance);
    }
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
