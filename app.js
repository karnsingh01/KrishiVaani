class KisanVaaniApp {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLang = 'ml-IN';
        this.isListening = false;

        // Enhanced agricultural data with more problems and fertilizer recommendations
        this.agriculturalData = {
            cropProblems: {
                'ഇലകൾ മഞ്ഞ': { 
                    diagnosis: 'നൈട്രജൻ കുറവ്', 
                    solution: 'യൂറിയ 25kg/ഏക്കർ തളിക്കുക. മഴയ്ക്ക് മുമ്പ് പ്രയോഗിക്കുക.',
                    fertilizers: ['യൂറിയ', 'അമോണിയം സൾഫേറ്റ്']
                },
                'yellow leaves': { 
                    diagnosis: 'Nitrogen deficiency', 
                    solution: 'Apply Urea 25kg/acre before rain. Also use organic compost.',
                    fertilizers: ['Urea', 'Ammonium Sulfate', 'Organic Compost']
                },
                'ഇലകൾ വാടി': {
                    diagnosis: 'ജല കുറവ് അല്ലെങ്കിൽ വേരുചീയൽ',
                    solution: 'ജലസേചനം പരിശോധിക്കുക. കാർബെൻഡാസിം സ്പ്രേ ചെയ്യുക.',
                    fertilizers: ['കാർബെൻഡാസിം', 'NPK 19:19:19']
                },
                'brown spots': {
                    diagnosis: 'Fungal infection',
                    solution: 'Use Carbendazim spray. Improve air circulation.',
                    fertilizers: ['Carbendazim', 'Copper Sulfate', 'Neem Oil']
                }
            }
        };

        this.schemes = [
            { name: "PM-KISAN", desc: "₹6000/വർഷം", link: "https://pmkisan.gov.in/" },
            { name: "Kudumbashree", desc: "കർഷക വായ്പകൾ", link: "https://www.kudumbashree.org/" },
            { name: "ATMA", desc: "കാർഷിക വിപുലീകരണം", link: "#" }
        ];

        this.initApp();
    }

    initApp() {
        // Show splash screen for 3 seconds
        setTimeout(() => {
            document.getElementById('splash').style.display = 'none';
            document.getElementById('appContent').style.display = 'block';
        }, 3000);

        // Set random greeting
        const greetings = ['നമസ്കാരം കർഷക സുഹൃത്തേ!', 'ഹലോ കൊച്ചി കർഷകേ!', 'വയനാട് കർഷകാ, സ്വാഗതം!'];
        document.getElementById('greeting').textContent = greetings[Math.floor(Math.random() * greetings.length)];

        // Set random daily tip
        const tips = [
            'മഴക്കാലത്ത് നാളികേരം ബഡ് റോട്ട് പരിശോധിക്കുക.',
            'നെല്ല് ജലസേചനം 5-7 ദിവസത്തിലൊരിക്കൽ.',
            'മണ്ണിന്റെ pH 6.5-7.5 വരെ നിലനിർത്തുക.',
            'Use organic fertilizers for better soil health.'
        ];
        document.getElementById('dailyTip').textContent = tips[Math.floor(Math.random() * tips.length)];

        this.checkSystemRequirements();
        this.setupEventListeners();
        this.populateSchemes();
    }

    checkSystemRequirements() {
        // Check if speech recognition is supported
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const micBtn = document.getElementById('micBtn');
        const status = document.getElementById('status');

        if (SpeechRecognition) {
            micBtn.disabled = false;
            status.textContent = 'മൈക്രോഫോൺ തയ്യാർ!';
            status.style.color = 'green';
        } else {
            status.textContent = 'ശബ്ദ പിന്തുണ ലഭ്യമല്ല.';
            status.style.color = 'red';
        }

        // Check HTTPS
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            status.textContent = 'HTTPS ആവശ്യമാണ് മൈക്രോഫോൺ പ്രവർത്തനത്തിന്.';
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

        // Voice input
        micBtn.addEventListener('click', () => this.startVoiceInput());

        // Text input
        sendBtn.addEventListener('click', () => this.processTextInput());
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processTextInput();
        });

        // Language selection
        langSelect.addEventListener('change', (e) => {
            this.currentLang = e.target.value;
        });

        // Weather and Mandi
        weatherBtn.addEventListener('click', () => this.fetchWeather(document.getElementById('cityInput').value || 'Kochi'));
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
            this.showError('ശബ്ദ പിന്തുണ ഈ ബ്രൗസറിൽ ലഭ്യമല്ല.');
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
                status.textContent = 'കേൾക്കുന്നു... സംസാരിക്കുക!';
                status.style.color = 'blue';
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('textInput').value = transcript;
                status.textContent = `കേട്ടു: "${transcript}"`;
                this.processQuery(transcript);
                this.stopListening();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                let errorMessage = 'ശബ്ദ പിശക്: ';

                switch(event.error) {
                    case 'not-allowed':
                        errorMessage += 'മൈക്രോഫോൺ അനുമതി നിഷേധിച്ചു. അനുമതി നൽകി വീണ്ടും ശ്രമിക്കുക.';
                        break;
                    case 'no-speech':
                        errorMessage += 'ശബ്ദം കേട്ടില്ല. വീണ്ടും ശ്രമിക്കുക.';
                        break;
                    case 'network':
                        errorMessage += 'നെറ്റ്‌വർക്ക് പിശക്.';
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
            this.showError('മൈക്രോഫോൺ ആരംഭിക്കാൻ കഴിയുന്നില്ല.');
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
        status.textContent = 'മൈക്രോഫോൺ തയ്യാർ!';
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

        if (lowerQuery.includes('കാലാവസ്ഥ') || lowerQuery.includes('weather')) {
            response = await this.fetchWeather('Kochi');
        } else if (lowerQuery.includes('വില') || lowerQuery.includes('price') || lowerQuery.includes('മാർക്കറ്റ്')) {
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

        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Crop preview" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;">`;
        };

        reader.readAsDataURL(file);
        document.getElementById('photoStatus').textContent = 'ഫോട്ടോ തയ്യാറായി!';
    }

    async analyzePhoto() {
        const photoInput = document.getElementById('photoInput');
        const photoStatus = document.getElementById('photoStatus');

        if (!photoInput.files[0]) {
            photoStatus.textContent = 'ദയവായി ഒരു ഫോട്ടോ തിരഞ്ഞെടുക്കുക.';
            photoStatus.style.color = 'red';
            return;
        }

        photoStatus.textContent = 'ഫോട്ടോ വിശകലനം ചെയ്യുന്നു...';
        photoStatus.style.color = 'blue';

        // Simulate AI analysis (replace with actual AI service)
        setTimeout(() => {
            // Random diagnosis for demo
            const problems = [
                {
                    diagnosis: 'ഇലകളിൽ മഞ്ഞനിറം കണ്ടെത്തി - നൈട്രജൻ കുറവ്',
                    solution: 'യൂറിയ 25kg/ഏക്കർ എന്ന തോതിൽ പ്രയോഗിക്കുക. മഴയ്ക്ക് മുമ്പ് നൽകുക.',
                    fertilizers: ['യൂറിയ', 'അമോണിയം സൾഫേറ്റ്', 'ജൈവ കമ്പോസ്റ്റ്']
                },
                {
                    diagnosis: 'ഇലകളിൽ തവിട്ടുനിറ പാടുകൾ - ഫംഗൽ അണുബാധ',
                    solution: 'കാർബെൻഡാസിം സ്പ്രേ ചെയ്യുക. വായു സഞ്ചാരം മെച്ചപ്പെടുത്തുക.',
                    fertilizers: ['കാർബെൻഡാസിം', 'കോപ്പർ സൾഫേറ്റ്', 'വേപ്പെണ്ണ']
                },
                {
                    diagnosis: 'ആരോഗ്യകരമായ സസ്യം - പ്രതിരോധ പരിചരണം ആവശ്യം',
                    solution: 'NPK 19:19:19 പ്രയോഗിക്കുക. ജൈവ കമ്പോസ്റ്റ് ചേർക്കുക.',
                    fertilizers: ['NPK 19:19:19', 'ജൈവ കമ്പോസ്റ്റ്', 'വേപ്പ് കേക്ക്']
                }
            ];

            const randomProblem = problems[Math.floor(Math.random() * problems.length)];

            const response = {
                diagnosis: randomProblem.diagnosis,
                solution: `${randomProblem.solution}\n\nശുപാർശ ചെയ്യുന്ന രാസവളങ്ങൾ: ${randomProblem.fertilizers.join(', ')}`,
                fertilizers: randomProblem.fertilizers
            };

            this.showResponse(response);
            this.speakResponse(response);

            photoStatus.textContent = 'വിശകലനം പൂർത്തീകരിച്ചു!';
            photoStatus.style.color = 'green';
        }, 2000);
    }

    async fetchWeather(city) {
        try {
            // Mock weather data for demo
            const weatherData = {
                solution: `${city} കാലാവസ്ഥ: 28°C, മഴ സാധ്യത 70%. കാർഷിക പ്രവർത്തനങ്ങൾക്ക് അനുകൂലം.`
            };
            return weatherData;
        } catch (err) {
            return { 
                solution: 'കാലാവസ്ഥ വിവരങ്ങൾ ലഭ്യമല്ല. പൊതുവേ 25-30°C, മഴ സാധ്യത.'
            };
        }
    }

    async fetchMandiPrices(commodity) {
        try {
            // Mock mandi prices for demo
            const prices = {
                'Tomato': '₹30/kg',
                'Onion': '₹25/kg', 
                'Rice': '₹45/kg',
                'Coconut': '₹35/piece'
            };

            return {
                solution: `${commodity} വില: ${prices[commodity] || '₹25/kg'} (പാലക്കാട് മണ്ടി). വിൽപ്പനയ്ക്ക് അനുകൂല സമയം.`
            };
        } catch (err) {
            return { 
                solution: 'മാർക്കറ്റ് വിലകൾ ലഭ്യമല്ല. ശരാശരി വില: ₹25-30/kg.'
            };
        }
    }

    getAIResponse(query) {
        // Enhanced AI response with fertilizer recommendations
        const lowerQuery = query.toLowerCase();

        for (const [key, data] of Object.entries(this.agriculturalData.cropProblems)) {
            if (lowerQuery.includes(key.toLowerCase()) || 
                lowerQuery.includes(data.diagnosis.toLowerCase())) {
                return {
                    diagnosis: data.diagnosis,
                    solution: `${data.solution}\n\nശുപാർശ ചെയ്യുന്ന രാസവളങ്ങൾ: ${data.fertilizers.join(', ')}`,
                    fertilizers: data.fertilizers
                };
            }
        }

        // Default response with general advice
        return { 
            diagnosis: 'പൊതു ഉപദേശം', 
            solution: 'മണ്ണ് പരിശോധന നടത്തുക. pH 6.5-7.5 നിലനിർത്തുക. ജൈവ കമ്പോസ്റ്റ് ഉപയോഗിക്കുക.\n\nശുപാർശ ചെയ്യുന്ന രാസവളങ്ങൾ: NPK 19:19:19, ജൈവ കമ്പോസ്റ്റ്',
            fertilizers: ['NPK 19:19:19', 'ജൈവ കമ്പോസ്റ്റ്', 'വേപ്പ് കേക്ക്']
        };
    }

    speakResponse(response) {
        if (this.synthesis && response.solution) {
            // Stop any ongoing speech
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
            html += `<div class="diagnosis"><strong>🔍 രോഗനിർണ്ണയം:</strong> ${response.diagnosis}</div>`;
        }

        if (response.solution) {
            html += `<div class="solution"><strong>💡 പരിഹാരം:</strong> ${response.solution.replace(/\n/g, '<br>')}</div>`;
        }

        if (response.fertilizers) {
            html += `<div class="fertilizers"><strong>🧪 ശുപാർശ ചെയ്യുന്ന രാസവളങ്ങൾ:</strong><ul>`;
            response.fertilizers.forEach(fertilizer => {
                html += `<li>${fertilizer}</li>`;
            });
            html += `</ul></div>`;
        }

        responseContent.innerHTML = html;
        responseSection.classList.remove('hidden');

        // Scroll to response
        responseSection.scrollIntoView({ behavior: 'smooth' });
    }

    showLoading() {
        const responseSection = document.getElementById('responseSection');
        const responseContent = document.getElementById('responseContent');

        responseContent.innerHTML = '<div class="loading">⏳ ഉത്തരം തയ്യാറാക്കുന്നു...</div>';
        responseSection.classList.remove('hidden');
    }

    showError(message) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.style.color = 'red';

        // Clear error after 5 seconds
        setTimeout(() => {
            status.textContent = 'മൈക്രോഫോൺ തയ്യാർ!';
            status.style.color = 'green';
        }, 5000);
    }

    populateSchemes() {
        const schemesList = document.getElementById('schemesList');

        this.schemes.forEach(scheme => {
            const div = document.createElement('div');
            div.className = 'scheme-item';
            div.innerHTML = `
                <h4>${scheme.name}</h4>
                <p>${scheme.desc}</p>
                <a href="${scheme.link}" target="_blank">കൂടുതൽ അറിയുക</a>
            `;
            schemesList.appendChild(div);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KisanVaaniApp();
});
