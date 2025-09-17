class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'hi-IN';
    this.permissionGranted = false;
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
  }

  async checkSystemRequirements() {
    const micBtn = document.getElementById('micBtn');
    const status = document.getElementById('status');
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      status.textContent = 'HTTPS की ज़रूरत – Netlify पर डिप्लॉय करें।';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      this.permissionGranted = true;
      micBtn.disabled = false;
      status.textContent = 'AI माइक तैयार – बोलें!';
    } catch (err) {
      console.error('Mic permission error:', err);
      status.textContent = 'माइक परमिशन दें। AI टेक्स्ट से भी जवाब देगा।';
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

    micBtn.addEventListener('click', () => this.startVoiceInput());
    sendBtn.addEventListener('click', () => this.processTextInput());
    textInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.processTextInput(); });

    langSelect.addEventListener('change', (e) => {
      this.currentLang = e.target.value;
      document.getElementById('status').textContent = `भाषा बदली: ${e.target.options[e.target.selectedIndex].text} – माइक दबाएँ।`;
    });

    weatherBtn.addEventListener('click', () => {
      const city = document.getElementById('cityInput').value || 'Kochi';
      this.processQuery(`कोच्चि का मौसम बताओ`); // AI prompt
    });

    mandiBtn.addEventListener('click', () => {
      const commodity = document.getElementById('commoditySelect').value || 'Tomato';
      const district = document.getElementById('mandiSearch').value || 'Palakkad';
      this.processQuery(`${commodity} की कीमत ${district} में बताओ`);
    });

    schemesBtn.addEventListener('click', () => {
      this.processQuery('PM-KISAN योजना की डिटेल्स बताओ');
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
        this.processQuery(''); // Fallback AI
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

    // Totally AI Call for All Queries
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

  // Other methods (showResponse, speakResponse, etc.) as before...
  speakResponse(response) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response.solution);
      utterance.lang = this.currentLang;
      utterance.rate = 0.9;
      this.synthesis.speak(utterance);
    }
  }

  showResponse(response) {
    document.getElementById('responseContent').innerHTML = `<div class="solution"><strong>🔍 AI उत्तर:</strong> ${response.solution}</div>`;
    document.getElementById('responseSection').classList.remove('hidden');
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
