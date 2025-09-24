class KisanVaaniApp {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLang = 'hi-IN';
        this.isListening = false;

        // Multilingual translations
        this.translations = {
            'hi-IN': {
                'app.name': 'KisanVaani',
                'app.title': 'KisanVaani किसान सहायक',
                'greetings.welcome': 'नमस्कार किसान मित्र!',
                'greetings.kochi': 'नमस्कार कृषक मित्र!',
                'greetings.wayanad': 'वायनाड के किसान, स्वागत!',
                'greetings.punjab': 'पंजाब के किसान भाई, नमस्कार!',
                'tip.title': '💡 आज की सलाह',
                'tip.content': 'बारिश के मौसम में धान की सिंचाई 5-7 दिन में करें।',
                'tip.coconut': 'नारियल में बड रॉट की जांच करें।',
                'tip.soil': 'मिट्टी का pH 6.5-7.5 बनाए रखें।',
                'tip.organic': 'मिट्टी की सेहत के लिए जैविक खाद का उपयोग करें।',
                'voice.title': '🎤 आवाज़ से पूछें!',
                'voice.description': 'फसल, मौसम, दाम, योजना - बोलें या टाइप करें।',
                'mic.checking': 'माइक्रोफ़ोन जाँच रहे हैं...',
                'mic.ready': 'माइक्रोफ़ोन तैयार!',
                'mic.listening': 'सुन रहे हैं... बोलिए!',
                'mic.heard': 'सुना गया:',
                'mic.denied': 'माइक्रोफ़ोन की अनुमति नहीं मिली। अनुमति दें और फिर कोशिश करें।',
                'mic.nospeech': 'आवाज़ नहीं सुनी। फिर कोशिश करें।',
                'mic.error': 'आवाज़ में त्रुटि:',
                'input.placeholder': 'यहाँ टाइप करें...',
                'buttons.send': 'भेजें',
                'photo.title': '📷 फसल फोटो अपलोड',
                'photo.description': 'अपनी फसल की फोटो अपलोड करें और समस्या पता करें',
                'photo.submit': 'फोटो का विश्लेषण करें',
                'photo.select': 'कृपया एक फोटो चुनें।',
                'photo.analyzing': 'फोटो का विश्लेषण हो रहा है...',
                'photo.ready': 'फोटो तैयार!',
                'photo.complete': 'विश्लेषण पूरा!',
                'weather.title': '🌤️ मौसम',
                'weather.placeholder': 'शहर का नाम',
                'weather.button': 'मौसम देखें',
                'mandi.title': '💰 बाजार भाव',
                'mandi.placeholder': 'फसल का नाम',
                'mandi.button': 'दाम जानें',
                'schemes.title': '🏛️ सरकारी योजनाएं',
                'response.title': '📝 जवाब',
                'response.loading': '⏳ जवाब तैयार हो रहा है...',
                'nav.voice': '🎤 आवाज़',
                'nav.photo': '📷 फोटो',
                'nav.weather': '🌤️ मौसम',
                'nav.mandi': '💰 दाम',
                'nav.schemes': '🏛️ योजना',
                'diagnosis': '🔍 रोग निदान:',
                'solution': '💡 समाधान:',
                'fertilizers': '🧪 सुझाई गई खाद:',
                'weather.info': 'मौसम: 28°C, बारिश की संभावना 70%। खेती के काम के लिए अनुकूल।',
                'price.info': 'भाव: ₹30/किलो (दिल्ली मंडी)। बिक्री के लिए अच्छा समय।',
                'general.advice': 'मिट्टी की जांच कराएं। pH 6.5-7.5 रखें। जैविक खाद का इस्तेमाल करें।'
            },
            'ml-IN': {
                'app.name': 'KisanVaani',
                'app.title': 'KisanVaani കർഷക സഹായി',
                'greetings.welcome': 'നമസ്കാരം കർഷക സുഹൃത്തേ!',
                'greetings.kochi': 'നമസ്കാരം, കൊച്ചി കർഷകേ!',
                'greetings.wayanad': 'വയനാട് കർഷകാ, സ്വാഗതം!',
                'greetings.punjab': 'പഞ്ചാബ് കർഷകാ, നമസ്കാരം!',
                'tip.title': '💡 ഇന്നത്തെ ടിപ്പ്',
                'tip.content': 'മഴക്കാലത്ത് നെല്ല് ജലസേചനം 5-7 ദിവസത്തിലൊരിക്കൽ.',
                'tip.coconut': 'നാളികേരം ബഡ് റോട്ട് പരിശോധിക്കുക.',
                'tip.soil': 'മണ്ണിന്റെ pH 6.5-7.5 വരെ നിലനിർത്തുക.',
                'tip.organic': 'മണ്ണിന്റെ ആരോഗ്യത്തിനായി ജൈവ വളം ഉപയോഗിക്കുക.',
                'voice.title': '🎤 ശബ്ദത്തിലൂടെ ചോദിക്കു!',
                'voice.description': 'ഫസൽ, കാലാവസ്ഥ, വില, പദ്ധതി – പറയൂ അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യൂ.',
                'mic.checking': 'മൈക്രോഫോൺ പരിശോധിക്കുന്നു...',
                'mic.ready': 'മൈക്രോഫോൺ തയ്യാർ!',
                'mic.listening': 'കേൾക്കുന്നു... സംസാരിക്കുക!',
                'mic.heard': 'കേട്ടു:',
                'mic.denied': 'മൈക്രോഫോൺ അനുമതി നിഷേധിച്ചു. അനുമതി നൽകി വീണ്ടും ശ്രമിക്കുക.',
                'mic.nospeech': 'ശബ്ദം കേട്ടില്ല. വീണ്ടും ശ്രമിക്കുക.',
                'mic.error': 'ശബ്ദ പിശക്:',
                'input.placeholder': 'ഇവിടെ ടൈപ്പ് ചെയ്യൂ...',
                'buttons.send': 'അയയ്ക്കുക',
                'photo.title': '📷 ഫസൽ ഫോട്ടോ അപ്‌ലോഡ്',
                'photo.description': 'നിങ്ങളുടെ ഫസലിന്റെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് പ്രശ്നം കണ്ടെത്തുക',
                'photo.submit': 'ഫോട്ടോ വിശകലനം ചെയ്യുക',
                'photo.select': 'ദയവായി ഒരു ഫോട്ടോ തിരഞ്ഞെടുക്കുക.',
                'photo.analyzing': 'ഫോട്ടോ വിശകലനം ചെയ്യുന്നു...',
                'photo.ready': 'ഫോട്ടോ തയ്യാറായി!',
                'photo.complete': 'വിശകലനം പൂർത്തീകരിച്ചു!',
                'weather.title': '🌤️ കാലാവസ്ഥ',
                'weather.placeholder': 'നഗരം നൽകുക',
                'weather.button': 'കാലാവസ്ഥ കാണുക',
                'mandi.title': '💰 മാർക്കറ്റ് വില',
                'mandi.placeholder': 'ഫസൽ പേര്',
                'mandi.button': 'വില അന്വേഷിക്കുക',
                'schemes.title': '🏛️ സർക്കാർ പദ്ധതികൾ',
                'response.title': '📝 ഉത്തരം',
                'response.loading': '⏳ ഉത്തരം തയ്യാറാക്കുന്നു...',
                'nav.voice': '🎤 ശബ്ദം',
                'nav.photo': '📷 ഫോട്ടോ',
                'nav.weather': '🌤️ കാലാവസ്ഥ',
                'nav.mandi': '💰 വില',
                'nav.schemes': '🏛️ പദ്ധതി',
                'diagnosis': '🔍 രോഗനിർണ്ണയം:',
                'solution': '💡 പരിഹാരം:',
                'fertilizers': '🧪 ശുപാർശ ചെയ്യുന്ന രാസവളങ്ങൾ:',
                'weather.info': 'കാലാവസ്ഥ: 28°C, മഴ സാധ്യത 70%. കാർഷിക പ്രവർത്തനങ്ങൾക്ക് അനുകൂലം.',
                'price.info': 'വില: ₹30/കിലോ (കൊച്ചി മണ്ടി). വിൽപ്പനയ്ക്ക് അനുകൂല സമയം.',
                'general.advice': 'മണ്ണ് പരിശോധന നടത്തുക. pH 6.5-7.5 നിലനിർത്തുക. ജൈവ കമ്പോസ്റ്റ് ഉപയോഗിക്കുക.'
            },
            'en-IN': {
                'app.name': 'KisanVaani',
                'app.title': 'KisanVaani Farmer Assistant',
                'greetings.welcome': 'Welcome, dear farmer!',
                'greetings.kochi': 'Welcome, Kochi farmer!',
                'greetings.wayanad': 'Wayanad farmer, welcome!',
                'greetings.punjab': 'Punjab farmer brother, welcome!',
                'tip.title': '💡 Today's Tip',
                'tip.content': 'During monsoon, irrigate paddy every 5-7 days.',
                'tip.coconut': 'Check coconut for bud rot during rainy season.',
                'tip.soil': 'Maintain soil pH between 6.5-7.5.',
                'tip.organic': 'Use organic fertilizers for better soil health.',
                'voice.title': '🎤 Ask by Voice!',
                'voice.description': 'Crop, weather, price, scheme - speak or type your query.',
                'mic.checking': 'Checking microphone...',
                'mic.ready': 'Microphone ready!',
                'mic.listening': 'Listening... speak now!',
                'mic.heard': 'Heard:',
                'mic.denied': 'Microphone access denied. Please allow microphone access and try again.',
                'mic.nospeech': 'No speech heard. Please try again.',
                'mic.error': 'Speech error:',
                'input.placeholder': 'Type here...',
                'buttons.send': 'Send',
                'photo.title': '📷 Upload Crop Photo',
                'photo.description': 'Upload your crop photo to identify problems',
                'photo.submit': 'Analyze Photo',
                'photo.select': 'Please select a photo.',
                'photo.analyzing': 'Analyzing photo...',
                'photo.ready': 'Photo ready!',
                'photo.complete': 'Analysis complete!',
                'weather.title': '🌤️ Weather',
                'weather.placeholder': 'Enter city name',
                'weather.button': 'Get Weather',
                'mandi.title': '💰 Market Price',
                'mandi.placeholder': 'Crop name',
                'mandi.button': 'Check Price',
                'schemes.title': '🏛️ Government Schemes',
                'response.title': '📝 Answer',
                'response.loading': '⏳ Preparing answer...',
                'nav.voice': '🎤 Voice',
                'nav.photo': '📷 Photo',
                'nav.weather': '🌤️ Weather',
                'nav.mandi': '💰 Price',
                'nav.schemes': '🏛️ Schemes',
                'diagnosis': '🔍 Diagnosis:',
                'solution': '💡 Solution:',
                'fertilizers': '🧪 Recommended Fertilizers:',
                'weather.info': 'Weather: 28°C, 70% chance of rain. Suitable for farming activities.',
                'price.info': 'Price: ₹30/kg (Delhi Mandi). Good time for selling.',
                'general.advice': 'Test your soil. Maintain pH 6.5-7.5. Use organic compost.'
            }
        };

        // Enhanced agricultural data with multilingual support
        this.agriculturalData = {
            'hi-IN': {
                cropProblems: {
                    'पत्ते पीले': { 
                        diagnosis: 'नाइट्रोजन की कमी', 
                        solution: 'यूरिया 25 किलो/एकड़ डालें। बारिश से पहले दें।',
                        fertilizers: ['यूरिया', 'अमोनियम सल्फेट', 'जैविक खाद']
                    },
                    'yellow leaves': { 
                        diagnosis: 'नाइट्रोजन की कमी', 
                        solution: 'यूरिया 25 किलो/एकड़ डालें। जैविक खाद भी मिलाएं।',
                        fertilizers: ['यूरिया', 'अमोनियम सल्फेट', 'जैविक कम्पोस्ट']
                    },
                    'पत्ते मुरझाए': {
                        diagnosis: 'पानी की कमी या जड़ सड़न',
                        solution: 'सिंचाई देखें। कार्बेंडाजिम छिड़काव करें।',
                        fertilizers: ['कार्बेंडाजिम', 'NPK 19:19:19']
                    },
                    'brown spots': {
                        diagnosis: 'फंगल संक्रमण',
                        solution: 'कार्बेंडाजिम स्प्रे करें। हवा का संचार बढ़ाएं।',
                        fertilizers: ['कार्बेंडाजिम', 'कॉपर सल्फेट', 'नीम तेल']
                    }
                }
            },
            'ml-IN': {
                cropProblems: {
                    'ഇലകൾ മഞ്ഞ': { 
                        diagnosis: 'നൈട്രജൻ കുറവ്', 
                        solution: 'യൂറിയ 25kg/ഏക്കർ തളിക്കുക. മഴയ്ക്ക് മുമ്പ് നൽകുക.',
                        fertilizers: ['യൂറിയ', 'അമോണിയം സൾഫേറ്റ്', 'ജൈവ കമ്പോസ്റ്റ്']
                    },
                    'yellow leaves': { 
                        diagnosis: 'നൈട്രജൻ കുറവ്', 
                        solution: 'യൂറിയ 25kg/ഏക്കർ പ്രയോഗിക്കുക. ജൈവ കമ്പോസ്റ്റ് ചേർക്കുക.',
                        fertilizers: ['യൂറിയ', 'അമോണിയം സൾഫേറ്റ്', 'ജൈവ കമ്പോസ്റ്റ്']
                    },
                    'ഇലകൾ വാടി': {
                        diagnosis: 'ജല കുറവ് അല്ലെങ്കിൽ വേരുചീയൽ',
                        solution: 'ജലസേചനം പരിശോധിക്കുക. കാർബെൻഡാസിം സ്പ്രേ ചെയ്യുക.',
                        fertilizers: ['കാർബെൻഡാസിം', 'NPK 19:19:19']
                    },
                    'brown spots': {
                        diagnosis: 'ഫംഗൽ അണുബാധ',
                        solution: 'കാർബെൻഡാസിം സ്പ്രേ ചെയ്യുക. വായു സഞ്ചാരം മെച്ചപ്പെടുത്തുക.',
                        fertilizers: ['കാർബെൻഡാസിം', 'കോപ്പർ സൾഫേറ്റ്', 'വേപ്പെണ്ണ']
                    }
                }
            },
            'en-IN': {
                cropProblems: {
                    'yellow leaves': { 
                        diagnosis: 'Nitrogen deficiency', 
                        solution: 'Apply Urea 25kg/acre before rain. Use organic compost too.',
                        fertilizers: ['Urea', 'Ammonium Sulfate', 'Organic Compost']
                    },
                    'wilted leaves': {
                        diagnosis: 'Water stress or root rot',
                        solution: 'Check irrigation. Apply Carbendazim spray.',
                        fertilizers: ['Carbendazim', 'NPK 19:19:19']
                    },
                    'brown spots': {
                        diagnosis: 'Fungal infection',
                        solution: 'Use Carbendazim spray. Improve air circulation.',
                        fertilizers: ['Carbendazim', 'Copper Sulfate', 'Neem Oil']
                    }
                }
            }
        };

        this.schemes = {
            'hi-IN': [
                { name: "PM-KISAN", desc: "₹6000/साल", link: "https://pmkisan.gov.in/" },
                { name: "Pradhan Mantri Fasal Bima Yojana", desc: "फसल बीमा योजना", link: "#" },
                { name: "Kisan Credit Card", desc: "किसान क्रेडिट कार्ड", link: "#" }
            ],
            'ml-IN': [
                { name: "PM-KISAN", desc: "₹6000/വർഷം", link: "https://pmkisan.gov.in/" },
                { name: "Kudumbashree", desc: "കർഷക വായ്പകൾ", link: "https://www.kudumbashree.org/" },
                { name: "ATMA", desc: "കാർഷിക വിപുലീകരണം", link: "#" }
            ],
            'en-IN': [
                { name: "PM-KISAN", desc: "₹6000/year direct benefit", link: "https://pmkisan.gov.in/" },
                { name: "Crop Insurance Scheme", desc: "Pradhan Mantri Fasal Bima Yojana", link: "#" },
                { name: "Kisan Credit Card", desc: "Agricultural credit facility", link: "#" }
            ]
        };

        this.initApp();
    }

    initApp() {
        // Show splash screen for 3 seconds
        setTimeout(() => {
            document.getElementById('splash').style.display = 'none';
            document.getElementById('appContent').style.display = 'block';
        }, 3000);

        this.updateLanguage();
        this.checkSystemRequirements();
        this.setupEventListeners();
        this.populateSchemes();
    }

    updateLanguage() {
        // Update all text elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translations[this.currentLang][key];
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translations[this.currentLang][key];
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Set random greeting
        const greetingKeys = ['greetings.welcome', 'greetings.kochi', 'greetings.wayanad', 'greetings.punjab'];
        const randomKey = greetingKeys[Math.floor(Math.random() * greetingKeys.length)];
        document.getElementById('greeting').textContent = this.translations[this.currentLang][randomKey];

        // Set random daily tip
        const tipKeys = ['tip.content', 'tip.coconut', 'tip.soil', 'tip.organic'];
        const randomTipKey = tipKeys[Math.floor(Math.random() * tipKeys.length)];
        document.getElementById('dailyTip').textContent = this.translations[this.currentLang][randomTipKey];

        // Update document language
        document.documentElement.lang = this.currentLang.split('-')[0];
    }

    checkSystemRequirements() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const micBtn = document.getElementById('micBtn');
        const status = document.getElementById('status');

        if (SpeechRecognition) {
            micBtn.disabled = false;
            status.textContent = this.translations[this.currentLang]['mic.ready'];
            status.style.color = 'green';
        } else {
            status.textContent = 'Speech recognition not supported';
            status.style.color = 'red';
        }

        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            status.textContent = 'HTTPS required for microphone access';
            status.style.color = 'orange';
        }
    }

    setupEventListeners() {
        const micBtn = document.getElementById('micBtn');
        const sendBtn = document.getElementById('sendBtn');
        const textInput = document.getElementById('textInput');
        const langSelect = document.getElementById('langSelect');
        const weatherBtn = document.getElementById('weatherBtn');
        const mandiBtn = document.getElementById('mandiBtn');
        const photoInput = document.getElementById('photoInput');
        const photoSubmitBtn = document.getElementById('photoSubmitBtn');

        // Language selection with dynamic update
        langSelect.addEventListener('change', (e) => {
            this.currentLang = e.target.value;
            this.updateLanguage();
            this.checkSystemRequirements();
            this.populateSchemes();
        });

        // Voice input
        micBtn.addEventListener('click', () => this.startVoiceInput());

        // Text input
        sendBtn.addEventListener('click', () => this.processTextInput());
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processTextInput();
        });

        // Weather and Mandi
        weatherBtn.addEventListener('click', () => this.fetchWeather(document.getElementById('cityInput').value || 'Delhi'));
        mandiBtn.addEventListener('click', () => this.fetchMandiPrices(document.getElementById('mandiSearch').value || 'Tomato'));

        // Photo upload functionality
        photoInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.previewImage(e.target.files[0]);
            }
        });

        photoSubmitBtn.addEventListener('click', () => this.analyzePhoto());

        // Bottom navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.nav-btn.active')?.classList.remove('active');
                e.target.classList.add('active');

                // Hide all sections
                document.querySelectorAll('.section-card, .voice-card').forEach(sec => sec.classList.add('hidden'));

                // Show selected section
                const section = e.target.dataset.section;
                if (section === 'voice') {
                    document.getElementById('voice-card').classList.remove('hidden');
                } else {
                    document.getElementById(section + 'Section').classList.remove('hidden');
                }
            });
        });
    }

    async startVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const micBtn = document.getElementById('micBtn');
        const status = document.getElementById('status');

        if (!SpeechRecognition) {
            this.showError('Speech recognition not supported in this browser.');
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = this.currentLang;
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                micBtn.classList.add('listening');
                micBtn.textContent = '🛑';
                status.textContent = this.translations[this.currentLang]['mic.listening'];
                status.style.color = 'blue';
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('textInput').value = transcript;
                status.textContent = `${this.translations[this.currentLang]['mic.heard']} "${transcript}"`;
                this.processQuery(transcript);
                this.stopListening();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                let errorMessage = this.translations[this.currentLang]['mic.error'] + ' ';

                switch(event.error) {
                    case 'not-allowed':
                        errorMessage = this.translations[this.currentLang]['mic.denied'];
                        break;
                    case 'no-speech':
                        errorMessage = this.translations[this.currentLang]['mic.nospeech'];
                        break;
                    case 'network':
                        errorMessage += 'Network error';
                        break;
                    default:
                        errorMessage += event.error;
                }

                this.showError(errorMessage);
                this.stopListening();
            };

            this.recognition.onend = () => {
                this.stopListening();
            };

            this.recognition.start();

        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showError('Cannot start microphone.');
        }
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }

        const micBtn = document.getElementById('micBtn');
        const status = document.getElementById('status');

        this.isListening = false;
        micBtn.classList.remove('listening');
        micBtn.textContent = '🎤';
        status.textContent = this.translations[this.currentLang]['mic.ready'];
        status.style.color = 'green';
    }

    processTextInput() {
        const textInput = document.getElementById('textInput');
        const query = textInput.value.trim();

        if (query) {
            this.processQuery(query);
            textInput.value = '';
        }
    }

    async processQuery(query) {
        const lowerQuery = query.toLowerCase();
        let response;

        // Show loading
        this.showLoading();

        if (lowerQuery.includes('मौसम') || lowerQuery.includes('കാലാവസ്ഥ') || lowerQuery.includes('weather')) {
            response = await this.fetchWeather('Delhi');
        } else if (lowerQuery.includes('दाम') || lowerQuery.includes('वाल') || lowerQuery.includes('വില') || lowerQuery.includes('price') || lowerQuery.includes('मार्केट')) {
            response = await this.fetchMandiPrices('Tomato');
        } else {
            response = this.getAIResponse(lowerQuery);
        }

        this.showResponse(response);
        this.speakResponse(response);
    }

    previewImage(file) {
        const preview = document.getElementById('photoPreview');
        const reader = new FileReader();

        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Crop preview" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;">`;
        };

        reader.readAsDataURL(file);
        document.getElementById('photoStatus').textContent = this.translations[this.currentLang]['photo.ready'];
    }

    async analyzePhoto() {
        const photoInput = document.getElementById('photoInput');
        const photoStatus = document.getElementById('photoStatus');

        if (!photoInput.files[0]) {
            photoStatus.textContent = this.translations[this.currentLang]['photo.select'];
            photoStatus.style.color = 'red';
            return;
        }

        photoStatus.textContent = this.translations[this.currentLang]['photo.analyzing'];
        photoStatus.style.color = 'blue';

        // Simulate AI analysis
        setTimeout(() => {
            const currentLangData = this.agriculturalData[this.currentLang];
            const problems = Object.values(currentLangData.cropProblems);
            const randomProblem = problems[Math.floor(Math.random() * problems.length)];

            const response = {
                diagnosis: randomProblem.diagnosis,
                solution: `${randomProblem.solution}\n\n${this.translations[this.currentLang]['fertilizers']} ${randomProblem.fertilizers.join(', ')}`,
                fertilizers: randomProblem.fertilizers
            };

            this.showResponse(response);
            this.speakResponse(response);

            photoStatus.textContent = this.translations[this.currentLang]['photo.complete'];
            photoStatus.style.color = 'green';
        }, 2000);
    }

    async fetchWeather(city) {
        return {
            solution: `${city} ${this.translations[this.currentLang]['weather.info']}`
        };
    }

    async fetchMandiPrices(commodity) {
        return {
            solution: `${commodity} ${this.translations[this.currentLang]['price.info']}`
        };
    }

    getAIResponse(query) {
        const lowerQuery = query.toLowerCase();
        const currentLangData = this.agriculturalData[this.currentLang];

        for (const [key, data] of Object.entries(currentLangData.cropProblems)) {
            if (lowerQuery.includes(key.toLowerCase()) || 
                lowerQuery.includes(data.diagnosis.toLowerCase())) {
                return {
                    diagnosis: data.diagnosis,
                    solution: `${data.solution}\n\n${this.translations[this.currentLang]['fertilizers']} ${data.fertilizers.join(', ')}`,
                    fertilizers: data.fertilizers
                };
            }
        }

        return { 
            diagnosis: this.translations[this.currentLang]['general.advice'].split('.')[0],
            solution: this.translations[this.currentLang]['general.advice'],
            fertilizers: ['NPK 19:19:19', 'जैविक कम्पोस्ट']
        };
    }

    speakResponse(response) {
        if (this.synthesis && response.solution) {
            this.synthesis.cancel();

            const text = response.solution.replace(/\n/g, ' ');
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.currentLang;
            utterance.rate = 0.8;
            utterance.volume = 1;

            this.synthesis.speak(utterance);
        }
    }

    showResponse(response) {
        const responseSection = document.getElementById('responseSection');
        const responseContent = document.getElementById('responseContent');

        let html = '';

        if (response.diagnosis) {
            html += `<div class="diagnosis"><strong>${this.translations[this.currentLang]['diagnosis']}</strong> ${response.diagnosis}</div>`;
        }

        if (response.solution) {
            html += `<div class="solution"><strong>${this.translations[this.currentLang]['solution']}</strong> ${response.solution.replace(/\n/g, '<br>')}</div>`;
        }

        if (response.fertilizers) {
            html += `<div class="fertilizers"><strong>${this.translations[this.currentLang]['fertilizers']}</strong><ul>`;
            response.fertilizers.forEach(fertilizer => {
                html += `<li>${fertilizer}</li>`;
            });
            html += `</ul></div>`;
        }

        responseContent.innerHTML = html;
        responseSection.classList.remove('hidden');

        responseSection.scrollIntoView({ behavior: 'smooth' });
    }

    showLoading() {
        const responseSection = document.getElementById('responseSection');
        const responseContent = document.getElementById('responseContent');

        responseContent.innerHTML = `<div class="loading">${this.translations[this.currentLang]['response.loading']}</div>`;
        responseSection.classList.remove('hidden');
    }

    showError(message) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.style.color = 'red';

        setTimeout(() => {
            status.textContent = this.translations[this.currentLang]['mic.ready'];
            status.style.color = 'green';
        }, 5000);
    }

    populateSchemes() {
        const schemesList = document.getElementById('schemesList');
        schemesList.innerHTML = '';

        const currentSchemes = this.schemes[this.currentLang];
        currentSchemes.forEach(scheme => {
            const div = document.createElement('div');
            div.className = 'scheme-item';
            div.innerHTML = `
                <h4>${scheme.name}</h4>
                <p>${scheme.desc}</p>
                <a href="${scheme.link}" target="_blank">Know More</a>
            `;
            schemesList.appendChild(div);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KisanVaaniApp();
});
