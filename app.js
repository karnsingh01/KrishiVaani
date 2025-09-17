// KrishiVaani Agricultural Voice Assistant - Fresh Complete Version
class KrishiVaani {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.currentTranscript = '';
        this.finalTranscript = '';
        this.permissionGranted = false;

        // Agricultural knowledge base
        this.agriculturalData = {
            cropProblems: {
                "पत्तियां पीली": {
                    diagnosis: "आपकी फसल में नाइट्रोजन की कमी के लक्षण दिख रहे हैं",
                    solution: "तुरंत यूरिया खाद का छिड़काव करें - 25 किलो प्रति एकड़। साथ ही नियमित सिंचाई करते रहें।",
                    urgency: "तुरंत कार्रवाई करें - 3-4 दिन में सुधार दिखेगा"
                },
                "भूरे धब्बे": {
                    diagnosis: "फसल में फंगल इन्फेक्शन (ब्लाइट) की समस्या है",
                    solution: "मैन्कोजेब या कॉपर सल्फेट का स्प्रे करें। शाम के समय छिड़काव करें।",
                    urgency: "जल्दी इलाज करें - 10-15 दिन में धब्बे कम होने लगेंगे"
                },
                "कीड़े लगे": {
                    diagnosis: "फसल में कीट प्रकोप है - संभवतः बोलवर्म या एफिड",
                    solution: "नीम का तेल या इमिडाक्लोप्रिड का छिड़काव करें। सुबह या शाम के समय स्प्रे करें।",
                    urgency: "तुरंत कार्रवाई करें - 2-3 दिन में कीड़ों की संख्या कम हो जाएगी"
                },
                "फसल सूख रही": {
                    diagnosis: "पानी की कमी या जड़ों में समस्या हो सकती है",
                    solution: "तुरंत सिंचाई करें। मिट्टी की नमी बनाए रखें। जिंक सल्फेट का छिड़काव भी करें।",
                    urgency: "तुरंत पानी दें - देर करने से फसल खराब हो सकती है"
                }
            },
            marketPrices: {
                "गेहूं": "गेहूं का वर्तमान भाव ₹2175 प्रति क्विंटल है दिल्ली मंडी में। कल से 2.3% बढ़ोतरी हुई है।",
                "चावल": "चावल का भाव ₹2850 प्रति क्विंटल है पंजाब मंडी में। 1.8% बढ़ोतरी हुई है।",
                "टमाटर": "टमाटर का भाव ₹1200 प्रति क्विंटल है महाराष्ट्र मंडी में। 5.2% गिरावट हुई है।",
                "प्याज": "प्याज का भाव ₹1650 प्रति क्विंटल है कर्नाटक मंडी में। स्थिर भाव चल रहे हैं।",
                "आलू": "आलू का भाव ₹1300 प्रति क्विंटल है उत्तर प्रदेश मंडी में।"
            },
            weather: {
                "आज": "आज का मौसम साफ है, तापमान 28°C। सिंचाई के लिए अच्छा दिन है।",
                "कल": "कल आंशिक बादल छाया रहेगा, तापमान 30°C। छिड़काव के लिए उपयुक्त।",
                "परसों": "परसों हल्की बारिश हो सकती है, तापमान 26°C। बाहरी काम टालें।"
            },
            schemes: {
                "आयुष्मान भारत": "आयुष्मान भारत योजना में प्रति परिवार ₹5 लाख तक का मुफ्त इलाज मिलता है। गरीबी रेखा से नीचे के परिवार इसका फायदा उठा सकते हैं।",
                "पीएम किसान": "PM-KISAN योजना में किसानों को प्रति वर्ष ₹6000 की सहायता मिलती है। यह तीन किस्तों में दी जाती है।"
            }
        };

        this.init();
    }

    init() {
        console.log('🌾 KrishiVaani Initializing...');
        this.checkSystemRequirements();
        this.setupEventListeners();
        this.updateStatus("सिस्टम तैयार हो रहा है...");
        console.log('✅ KrishiVaani Ready!');
    }

    checkSystemRequirements() {
        const httpsStatus = document.getElementById('httpsStatus');
        const httpsText = document.getElementById('httpsText');
        const browserStatus = document.getElementById('browserStatus');
        const browserText = document.getElementById('browserText');
        const micStatus = document.getElementById('micStatus');
        const micText = document.getElementById('micText');

        // Check HTTPS
        const isHttps = location.protocol === 'https:' || location.hostname === 'localhost';
        if (isHttps) {
            httpsStatus.textContent = '🟢';
            httpsText.textContent = 'Secure';
            httpsText.className = 'status-ready';
        } else {
            httpsStatus.textContent = '🔴';
            httpsText.textContent = 'Need HTTPS';
            httpsText.className = 'status-error';
        }

        // Check Browser Support
        const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        const hasGetUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

        if (hasSpeechRecognition && hasGetUserMedia) {
            browserStatus.textContent = '🟢';
            browserText.textContent = 'Compatible';
            browserText.className = 'status-ready';
        } else {
            browserStatus.textContent = '🔴';
            browserText.textContent = 'Use Chrome/Edge';
            browserText.className = 'status-error';
        }

        // Update mic status
        micStatus.textContent = '🎤';
        micText.textContent = 'Ready to test';
        micText.className = 'status-warning';

        // Enable/disable mic button based on system readiness
        const micBtn = document.getElementById('micBtn');
        if (isHttps && hasSpeechRecognition && hasGetUserMedia) {
            micBtn.disabled = false;
            this.updateStatus("माइक बटन दबाएं और बोलें");
        } else {
            micBtn.disabled = true;
            this.updateStatus("सिस्टम रिक्वायरमेंट्स चेक करें");
            this.showFallback();
        }
    }

    setupEventListeners() {
        const micBtn = document.getElementById('micBtn');
        const retryBtn = document.getElementById('retryBtn');
        const sendBtn = document.getElementById('sendBtn');
        const textInput = document.getElementById('textInput');
        const questionBtns = document.querySelectorAll('.question-btn');

        if (micBtn) {
            micBtn.addEventListener('click', () => this.startVoiceInput());
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryVoiceInput());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.processTextInput());
        }

        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.processTextInput();
                }
            });
        }

        questionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.processQuery(question);
            });
        });

        console.log('✅ Event listeners setup complete');
    }

    async startVoiceInput() {
        console.log('🎤 Starting voice input...');
        this.hideAllSections();
        this.updateStatus("माइक की अनुमति मांगी जा रही है...");
        this.setMicState('requesting');

        try {
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            console.log('✅ Microphone permission granted');

            // Permission granted, stop the stream
            stream.getTracks().forEach(track => track.stop());

            // Update status
            const micText = document.getElementById('micText');
            if (micText) {
                micText.textContent = 'Permission granted';
                micText.className = 'status-ready';
            }

            this.permissionGranted = true;

            // Initialize speech recognition
            await this.initializeSpeechRecognition();

        } catch (error) {
            console.error('❌ Microphone error:', error);
            this.handleMicrophoneError(error);
        }
    }

    async initializeSpeechRecognition() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported');
            }

            console.log('🗣️ Initializing speech recognition...');

            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'hi-IN';
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                console.log('✅ Speech recognition started');
                this.isListening = true;
                this.updateStatus("सुन रहा हूं... बोलिए");
                this.setMicState('listening');
                this.showTranscript();
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update transcript display
                const transcriptDisplay = finalTranscript || interimTranscript;
                this.updateTranscript(transcriptDisplay);

                if (finalTranscript.trim()) {
                    console.log('📝 Final transcript:', finalTranscript);
                    this.finalTranscript = finalTranscript.trim();
                    this.updateStatus("AI सोच रहा है...");
                    this.setMicState('thinking');
                    setTimeout(() => {
                        this.processQuery(this.finalTranscript);
                    }, 1200);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('❌ Speech recognition error:', event.error);
                this.isListening = false;
                this.handleSpeechError(event.error);
            };

            this.recognition.onend = () => {
                console.log('🔚 Speech recognition ended');
                this.isListening = false;
                if (!this.finalTranscript) {
                    this.updateStatus("कुछ नहीं सुनाई दिया। कृपया दोबारा कोशिश करें।");
                    this.setMicState('error');
                    this.showError("स्पष्ट आवाज में बोलें और दोबारा कोशिश करें।");
                }
            };

            // Start recognition
            this.recognition.start();
            console.log('🎙️ Speech recognition started');

        } catch (error) {
            console.error('❌ Recognition initialization error:', error);
            this.handleMicrophoneError(error);
        }
    }

    handleMicrophoneError(error) {
        let errorMessage = "माइक्रोफोन की समस्या हुई।";

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage = "माइक्रोफोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग में माइक को allow करें।";
        } else if (error.name === 'NotFoundError') {
            errorMessage = "कोई माइक्रोफोन नहीं मिला। कृपया माइक्रोफोन कनेक्ट करें।";
        } else if (error.message === 'Speech recognition not supported') {
            errorMessage = "यह ब्राउज़र समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।";
        }

        console.error('❌ Microphone error handled:', errorMessage);

        this.showError(errorMessage);
        this.setMicState('error');
        this.showFallback();

        // Update mic status
        const micText = document.getElementById('micText');
        if (micText) {
            micText.textContent = 'Error occurred';
            micText.className = 'status-error';
        }
    }

    handleSpeechError(errorType) {
        let message = "आवाज पहचान में समस्या हुई।";

        switch (errorType) {
            case 'not-allowed':
            case 'permission-denied':
                message = "माइक्रोफोन की अनुमति नहीं मिली। कृपया allow करें।";
                break;
            case 'no-speech':
                message = "कुछ नहीं सुनाई दिया। कृपया साफ आवाज में दोबारा बोलें।";
                break;
            case 'audio-capture':
                message = "माइक्रोफोन की समस्या। कृपया चेक करें कि माइक काम कर रहा है।";
                break;
            case 'network':
                message = "नेटवर्क की समस्या। इंटरनेट कनेक्शन चेक करें।";
                break;
            case 'aborted':
                message = "आवाज पहचान रुक गई। कृपया दोबारा कोशिश करें।";
                break;
        }

        console.error('🔊 Speech error handled:', message);

        this.showError(message);
        this.setMicState('error');
    }

    processQuery(query) {
        if (!query || !query.trim()) {
            this.showError("कोई प्रश्न नहीं मिला। कृपया दोबारा कोशिश करें।");
            return;
        }

        console.log('🤖 Processing query:', query);

        const lowerQuery = query.toLowerCase();
        const response = this.getAIResponse(lowerQuery);

        this.showResponse(response);
        this.speakResponse(response);
    }

    getAIResponse(query) {
        console.log('🧠 Generating AI response for:', query);

        // Check crop problems
        for (const [problem, data] of Object.entries(this.agriculturalData.cropProblems)) {
            if (query.includes(problem.toLowerCase())) {
                return {
                    type: 'crop_problem',
                    diagnosis: data.diagnosis,
                    solution: data.solution,
                    urgency: data.urgency
                };
            }
        }

        // Check market prices
        for (const [crop, priceInfo] of Object.entries(this.agriculturalData.marketPrices)) {
            if (query.includes(crop) && (query.includes('कीमत') || query.includes('भाव') || query.includes('rate'))) {
                return {
                    type: 'market_price',
                    diagnosis: `${crop} की कीमत की जानकारी`,
                    solution: priceInfo,
                    urgency: "नवीनतम बाजार भाव"
                };
            }
        }

        // Check weather
        if (query.includes('मौसम') || query.includes('weather')) {
            return {
                type: 'weather',
                diagnosis: "मौसम की जानकारी",
                solution: this.agriculturalData.weather["आज"],
                urgency: "आज के लिए सलाह"
            };
        }

        // Check government schemes
        for (const [scheme, info] of Object.entries(this.agriculturalData.schemes)) {
            if (query.includes(scheme.toLowerCase())) {
                return {
                    type: 'scheme',
                    diagnosis: `${scheme} योजना की जानकारी`,
                    solution: info,
                    urgency: "सरकारी योजना"
                };
            }
        }

        // Default response
        return {
            type: 'general',
            diagnosis: "आपका प्रश्न मिल गया",
            solution: "मैं आपकी कृषि संबंधी समस्याओं में मदद के लिए यहां हूं। कृपया फसल की बीमारी, कीमतों, या मौसम के बारे में पूछें।",
            urgency: "अधिक जानकारी के लिए स्पष्ट प्रश्न पूछें"
        };
    }

    speakResponse(response) {
        if ('speechSynthesis' in window) {
            console.log('🔊 Speaking response...');
            this.updateStatus("जवाब दे रहा हूं...");
            this.setMicState('speaking');

            const text = `${response.diagnosis}। ${response.solution}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'hi-IN';
            utterance.rate = 0.9;
            utterance.volume = 0.8;

            utterance.onend = () => {
                console.log('✅ Speaking completed');
                this.updateStatus("माइक बटन दबाएं और बोलें");
                this.setMicState('ready');
            };

            utterance.onerror = () => {
                console.log('❌ Speaking error');
                this.updateStatus("माइक बटन दबाएं और बोलें");
                this.setMicState('ready');
            };

            this.synthesis.speak(utterance);
        } else {
            console.log('🔇 Speech synthesis not available');
            this.updateStatus("माइक बटन दबाएं और बोलें");
            this.setMicState('ready');
        }
    }

    processTextInput() {
        const textInput = document.getElementById('textInput');
        const query = textInput?.value.trim();

        if (query) {
            console.log('⌨️ Processing text input:', query);
            textInput.value = '';
            this.updateTranscript(query);
            this.showTranscript();
            this.processQuery(query);
        }
    }

    retryVoiceInput() {
        console.log('🔄 Retrying voice input...');
        this.hideAllSections();
        this.finalTranscript = '';
        this.currentTranscript = '';

        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }

        if (this.synthesis) {
            this.synthesis.cancel();
        }

        setTimeout(() => {
            this.startVoiceInput();
        }, 500);
    }

    // UI Helper Methods
    updateStatus(message) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = message;
        }
        console.log('📱 Status updated:', message);
    }

    setMicState(state) {
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            micBtn.className = `mic-btn ${state}`;
        }
        console.log('🎤 Mic state:', state);
    }

    updateTranscript(text) {
        const transcriptEl = document.getElementById('transcript');
        if (transcriptEl) {
            transcriptEl.textContent = text;
        }
    }

    showTranscript() {
        const section = document.getElementById('transcriptSection');
        if (section) {
            section.classList.remove('hidden');
        }
    }

    showResponse(response) {
        const section = document.getElementById('responseSection');
        const content = document.getElementById('responseContent');

        if (section && content) {
            let html = `<div class="diagnosis"><strong>🔍 निदान:</strong> ${response.diagnosis}</div>`;
            html += `<div class="solution"><strong>💡 समाधान:</strong> ${response.solution}</div>`;

            if (response.urgency) {
                html += `<div class="urgency"><strong>⚡ जरूरी:</strong> ${response.urgency}</div>`;
            }

            content.innerHTML = html;
            section.classList.remove('hidden');
        }
    }

    showError(message) {
        const section = document.getElementById('errorSection');
        const messageEl = document.getElementById('errorMessage');

        if (section && messageEl) {
            messageEl.textContent = message;
            section.classList.remove('hidden');
        }
    }

    showFallback() {
        const section = document.getElementById('fallbackSection');
        if (section) {
            section.classList.remove('hidden');
        }
    }

    hideAllSections() {
        const sections = ['transcriptSection', 'responseSection', 'errorSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('hidden');
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌾 KrishiVaani DOM loaded, starting app...');

    try {
        new KrishiVaani();
    } catch (error) {
        console.error('❌ Failed to initialize KrishiVaani:', error);

        // Show error in UI if possible
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = 'ऐप लोड करने में समस्या हुई। पेज रीफ्रेश करें।';
            statusEl.style.color = '#ef4444';
        }
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
});