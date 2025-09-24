class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'hi-IN'; // Changed default to Hindi
    this.translations = {
      'hi-IN': {
        greeting: ['नमस्कार, कोचि किसान!', 'हैलो, वायनाड किसान!'],
        dailyTip: ['मानसून में नारियल बड रॉट जांचें।', 'धान सिंचाई: 5-7 दिन।'],
        title: '🌿 किसानवाणी',
        subtitle: 'केरल के किसानों के लिए AI सहायक',
        adviceTitle: '🌟 आज की सलाह',
        adviceText: 'मानसून में धान सिंचाई 5-7 दिनों में एक बार।',
        voicePrompt: '🎤 सब कुछ पूछें - आवाज में! फसल, मौसम, कीमत, योजना - बोलें या टाइप करें।',
        sendBtn: 'भेजें',
        responseTitle: '🤖 उत्तर:',
        homeNav: '🏠 होम',
        weatherNav: '☀️ मौसम',
        marketNav: '🛒 बाजार',
        schemesNav: '🏛️ योजनाएं',
        cropNav: '📸 फसल फोटो', // New
        weatherTitle: '☀️ IMD मौसम (कोचि)',
        weatherBtn: 'देखें',
        marketTitle: '🛒 बाजार कीमतें (केरल)',
        cropBtn: 'टमाटर टमाटर\nप्याज\nअनानास', // Simplified
        searchBtn: 'खोजें',
        schemesTitle: '🏛️ किसान योजनाएं',
        errorMic: 'आवाज समर्थन नहीं।',
        errorVoice: 'आवाज त्रुटि।'
      },
      'ml-IN': {
        // Existing Malayalam translations (fallback)
        greeting: ['നമസ്കാരം, കൊച്ചി കർഷകേ!', 'ഹലോ, വയനാട് കർഷകാ!'],
        dailyTip: ['മഴക്കാലത്ത് നാളികേരം ബഡ് റോട്ട് പരിശോധിക്കുക.', 'Paddy irrigation: 5-7 days.'],
        title: '🌿 KisanVaani',
        subtitle: 'നമസ്കാരം! ഇന്നത്തെ ടിപ്പ്: നാളികേരത്തിൽ ബഡ് റോട്ട് പരിശോധിക്കുക.',
        // ... (add rest as needed)
      },
      'en-US': {
        // English fallback
        greeting: ['Hello, Kochi Farmer!', 'Hi, Wayanad Farmer!'],
        // ... (add rest)
      }
    };
    this.agriculturalData = { /* unchanged */ };
    this.schemes = [ /* unchanged */ ];
    this.initApp();
  }

  initApp() {
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('appContent').style.display = 'block';
    }, 3000);

    this.updateUI(); // New: Apply translations on init
    const greetings = this.translations[this.currentLang].greeting || ['Default Greeting'];
    document.getElementById('greeting').textContent = greetings[Math.floor(Math.random() * greetings.length)];
    // Similar for tips...

    this.checkSystemRequirements();
    this.setupEventListeners();
    this.populateSchemes();
  }

  updateUI() {
    const t = this.translations[this.currentLang] || this.translations['en-US'];
    document.querySelector('.title').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.getElementById('adviceTitle').textContent = t.adviceTitle;
    document.getElementById('adviceText').textContent = t.adviceText;
    document.querySelector('.voice-prompt').textContent = t.voicePrompt;
    document.getElementById('sendBtn').textContent = t.sendBtn;
    // Add more selectors as needed (e.g., nav buttons, section titles)
    document.querySelectorAll('.nav-btn[data-i18n]').forEach(btn => {
      btn.textContent = t[btn.dataset.i18n];
    });
  }

  setupEventListeners() {
    // Existing...
    const langSelect = document.getElementById('langSelect');
    langSelect.addEventListener('change', (e) => {
      this.currentLang = e.target.value;
      this.updateUI(); // New: Refresh UI on lang change
      this.speakResponse({ solution: 'भाषा बदली गई।' }); // Feedback
    });

    // New: Camera button listener
    const cropBtn = document.getElementById('cropBtn');
    cropBtn.addEventListener('click', () => this.startCamera());

    // Existing nav listeners, add new for crop:
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Existing...
        if (e.target.dataset.section === 'crop') {
          document.getElementById('cropSection').classList.remove('hidden');
        }
      });
    });
  }

  async startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return this.showError(this.translations[this.currentLang]?.errorMic || 'Voice support unavailable.');
    
    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.currentLang;
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('textInput').value = transcript; // Show in input
      this.processQuery(transcript);
    };
    this.recognition.onerror = () => this.showError(this.translations[this.currentLang]?.errorVoice || 'Voice error.');
    this.recognition.start();
    document.getElementById('micBtn').classList.add('listening');
    this.recognition.onend = () => document.getElementById('micBtn').classList.remove('listening');
  }

  async processQuery(query) {
    // Enhanced: Send to AI first, fallback to local
    try {
      const aiRes = await fetch(`/.netlify/functions/ai-query?query=${encodeURIComponent(query)}&lang=${this.currentLang}`);
      const response = await aiRes.json();
      this.showResponse(response);
      this.speakResponse(response);
    } catch (err) {
      // Fallback to local
      const localRes = this.getAIResponse(query.toLowerCase());
      this.showResponse(localRes);
      this.speakResponse(localRes);
    }
  }

  // New: Camera for Crop Photo
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.getElementById('cropVideo'); // Add <video id="cropVideo"> in HTML
      const canvas = document.getElementById('cropCanvas'); // Add <canvas id="cropCanvas" style="display:none;"></canvas>
      video.srcObject = stream;
      video.play();

      // Capture button logic (add in HTML: <button id="captureBtn">Snap Photo</button>)
      document.getElementById('captureBtn').onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        stream.getTracks().forEach(track => track.stop());
        video.style.display = 'none';

        // Send to AI for analysis
        this.analyzeCropPhoto(imageData);
      };
    } catch (err) {
      this.showError('कैमरा एक्सेस नहीं मिला।');
    }
  }

  async analyzeCropPhoto(imageData) {
    try {
      const res = await fetch(`/.netlify/functions/crop-analyze`, {
        method: 'POST',
        body: JSON.stringify({ image: imageData, lang: this.currentLang })
      });
      const response = await res.json();
      this.showResponse(response);
      this.speakResponse(response);
      // Display photo
      document.getElementById('cropPhoto').src = imageData; // Add <img id="cropPhoto">
    } catch (err) {
      this.showError('फसल विश्लेषण विफल। फॉलबैक: पत्तियां पीली - नाइट्रोजन की कमी।');
    }
  }

  // Rest unchanged...
}

document.addEventListener('DOMContentLoaded', () => new KisanVaaniApp());
