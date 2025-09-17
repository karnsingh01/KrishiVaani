class KisanVaaniApp {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentLang = 'hi-IN'; // Default Hindi
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
      // Add more crops as needed
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
      micBtn.disabled = true;
    }

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
      this.populateCommodities(); // Update dropdown labels
    });

    weatherBtn.addEventListener('click', () => {
      const city = document.getElementById('cityInput').value || 'Kochi';
      this.fetchWeather(city).then(response => {
        document.getElementById('weatherOutput').innerHTML = `<div class="solution">${response
