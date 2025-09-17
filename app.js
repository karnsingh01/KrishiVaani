document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('micBtn');
    const status = document.getElementById('status');
    const transcriptSection = document.getElementById('transcriptSection');
    const transcriptText = document.getElementById('transcript');
    const responseSection = document.getElementById('responseSection');
    const responseContent = document.getElementById('responseContent');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');
    const textInput = document.getElementById('textInput');
    const sendBtn = document.getElementById('sendBtn');
    const fallbackSection = document.getElementById('fallbackSection');
    const questionBtns = document.querySelectorAll('.question-btn');
    const httpsText = document.getElementById('httpsText');
    const browserText = document.getElementById('browserText');
    const micText = document.getElementById('micText');
    const httpsStatusIcon = document.getElementById('httpsStatus');
    const browserStatusIcon = document.getElementById('browserStatus');
    const micStatusIcon = document.getElementById('micStatus');
    const langSelect = document.getElementById('langSelect');

    let isListening = false;
    let recognition;
    let currentLang = 'hi-IN';

    // Check system status
    const checkSystemStatus = () => {
        // HTTPS Status
        if (window.location.protocol === 'https:') {
            httpsText.textContent = 'Ready';
            httpsText.classList.add('status-ready');
            httpsStatusIcon.textContent = '✅';
        } else {
            httpsText.textContent = 'Not Secure';
            httpsText.classList.add('status-error');
            httpsStatusIcon.textContent = '❌';
            showError('वॉइस असिस्टेंस केवल HTTPS पर काम करता है।');
        }

        // Browser Compatibility
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            browserText.textContent = 'Compatible';
            browserText.classList.add('status-ready');
            browserStatusIcon.textContent = '✅';
            fallbackSection.classList.add('hidden');
        } else {
            browserText.textContent = 'Not Compatible';
            browserText.classList.add('status-error');
            browserStatusIcon.textContent = '❌';
            fallbackSection.classList.remove('hidden');
            showError('आपका ब्राउज़र वॉइस असिस्टेंस का समर्थन नहीं करता है। कृपया टाइप करके पूछें।');
        }
    };
    
    checkSystemStatus();

    // Voice recognition setup
    const setupVoiceRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = currentLang;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                isListening = true;
                status.textContent = 'बोलें...';
                micBtn.classList.add('listening');
                micText.textContent = 'Listening...';
                micText.classList.add('status-ready');
                micStatusIcon.textContent = '✅';
                hideSections();
            };

            recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                transcriptText.textContent = result;
                transcriptSection.classList.remove('hidden');
                status.textContent = 'सोच रहा है...';
                micBtn.classList.remove('listening');
                micBtn.classList.add('thinking');
                getResponse(result);
            };

            recognition.onspeechend = () => {
                if (isListening) {
                    recognition.stop();
                    isListening = false;
                }
            };

            recognition.onerror = (event) => {
                isListening = false;
                micBtn.classList.remove('listening', 'thinking');
                micBtn.classList.add('error');
                if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                    showError('माइक की अनुमति नहीं दी गई। कृपया इसे सक्षम करें।');
                    micText.textContent = 'Permission denied';
                    micText.classList.add('status-error');
                    micStatusIcon.textContent = '❌';
                } else if (event.error === 'no-speech') {
                    showError('कोई आवाज़ नहीं सुनी गई। कृपया फिर से कोशिश करें।');
                } else {
                    showError('कुछ गलत हो गया।');
                }
                status.textContent = 'माइक बटन दबाएं और बोलें';
            };

            recognition.onend = () => {
                isListening = false;
                micBtn.classList.remove('listening', 'thinking', 'speaking', 'error');
                status.textContent = 'माइक बटन दबाएं और बोलें';
            };
        } else {
            micBtn.disabled = true;
            showError('आपका ब्राउज़र वॉइस असिस्टेंस का समर्थन नहीं करता है।');
            status.textContent = 'यह ब्राउज़र काम नहीं करेगा';
            micText.textContent = 'Not supported';
            micText.classList.add('status-error');
            micStatusIcon.textContent = '❌';
        }
    };

    setupVoiceRecognition();

    // Event Listeners
    micBtn.addEventListener('click', () => {
        if (!isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    });

    langSelect.addEventListener('change', (event) => {
        currentLang = event.target.value;
        setupVoiceRecognition(); // Re-initialize with new language
        status.textContent = 'माइक बटन दबाएं और बोलें'; // Reset status text
        if (currentLang !== 'hi-IN') {
            alert('Language changed. Note: The demo responses are still in Hindi.');
        }
    });

    sendBtn.addEventListener('click', () => {
        const query = textInput.value;
        if (query.trim() !== '') {
            processQuery(query);
        }
    });

    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = textInput.value;
            if (query.trim() !== '') {
                processQuery(query);
            }
        }
    });

    retryBtn.addEventListener('click', () => {
        hideSections();
    });

    questionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            processQuery(question);
        });
    });

    // Helper Functions
    function hideSections() {
        transcriptSection.classList.add('hidden');
        responseSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        responseContent.innerHTML = '';
        errorMessage.textContent = '';
        textInput.value = '';
    }

    function showError(message) {
        hideSections();
        errorSection.classList.remove('hidden');
        errorMessage.textContent = message;
    }

    async function getResponse(query) {
        micBtn.classList.remove('thinking');
        micBtn.classList.add('speaking');
        status.textContent = 'जवाब दे रहा है...';

        try {
            const response = await mockApiCall(query);
            micBtn.classList.remove('speaking');
            status.textContent = 'माइक बटन दबाएं और बोलें';
            displayResponse(response);
        } catch (err) {
            showError('AI से जवाब प्राप्त करने में समस्या हुई।');
            micBtn.classList.remove('speaking');
            status.textContent = 'माइक बटन दबाएं और बोलें';
        }
    }

    function processQuery(query) {
        hideSections();
        transcriptText.textContent = query;
        transcriptSection.classList.remove('hidden');
        textInput.value = '';
        status.textContent = 'सोच रहा है...';
        getResponse(query);
    }

    function displayResponse(response) {
        responseSection.classList.remove('hidden');
        responseContent.innerHTML = ''; // Clear previous content

        if (response.type === 'info') {
            responseContent.innerHTML = `<p>${response.text}</p>`;
        } else if (response.type === 'diagnose') {
            const diagnosisDiv = document.createElement('div');
            diagnosisDiv.classList.add('diagnosis');
            diagnosisDiv.innerHTML = `<h4>पहचान:</h4><p>${response.diagnosis}</p>`;
            responseContent.appendChild(diagnosisDiv);

            if (response.solution) {
                const solutionDiv = document.createElement('div');
                solutionDiv.classList.add('solution');
                solutionDiv.innerHTML = `<h4>समाधान:</h4><p>${response.solution}</p>`;
                responseContent.appendChild(solutionDiv);
            }
            
            if (response.urgency) {
                const urgencyDiv = document.createElement('div');
                urgencyDiv.classList.add('urgency');
                urgencyDiv.textContent = `तत्काल: ${response.urgency}`;
                responseContent.appendChild(urgencyDiv);
            }
        } else if (response.type === 'mandi') {
            const mandiHtml = `
                <h4>आज का ${response.item} भाव</h4>
                <p>${response.location}: ${response.price}</p>
            `;
            responseContent.innerHTML = mandiHtml;
        } else if (response.type === 'scheme') {
            const schemeHtml = `
                <h4>सरकारी योजना: ${response.schemeName}</h4>
                <p>${response.description}</p>
            `;
            responseContent.innerHTML = schemeHtml;
        }

        // Text-to-speech
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(response.text);
            utterance.lang = 'hi-IN';
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // Mock API Call - Simulates a real API response from government and AI tools
    function mockApiCall(query) {
        const queryLower = query.toLowerCase();
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let responseData;
                if (queryLower.includes('कीमत') || queryLower.includes('bhav') || queryLower.includes('price')) {
                    if (queryLower.includes('गेहूं') || queryLower.includes('wheat')) {
                        responseData = {
                            type: 'mandi',
                            text: 'आज दिल्ली की आजादपुर मंडी में गेहूं का भाव ₹2,500 प्रति क्विंटल है।',
                            item: 'गेहूं',
                            location: 'दिल्ली, आजादपुर मंडी',
                            price: '₹2,500 प्रति क्विंटल'
                        };
                    } else if (queryLower.includes('टमाटर') || queryLower.includes('tomato')) {
                        responseData = {
                            type: 'mandi',
                            text: 'आज दिल्ली की आजादपुर मंडी में टमाटर का भाव ₹2,200 प्रति क्विंटल है।',
                            item: 'टमाटर',
                            location: 'दिल्ली, आजादपुर मंडी',
                            price: '₹2,200 प्रति क्विंटल'
                        };
                    } else {
                         responseData = {
                            type: 'info',
                            text: 'आप किस सब्जी या फल का भाव जानना चाहते हैं? मैं मंडी भाव की जानकारी दे सकता हूं।',
                        };
                    }
                } else if (queryLower.includes('मौसम') || queryLower.includes('weather') || queryLower.includes('mausam')) {
                    responseData = {
                        type: 'info',
                        text: 'आज का मौसम साफ रहेगा। अगले 24 घंटों में बारिश की कोई संभावना नहीं है।',
                    };
                } else if (queryLower.includes('पत्तियां पीली') || queryLower.includes('yellow leaves')) {
                    responseData = {
                        type: 'diagnose',
                        text: 'आपकी फसल में नाइट्रोजन की कमी हो सकती है। यह पानी की अधिकता का भी संकेत हो सकता है। आप प्रति एकड़ 20-30 किलोग्राम यूरिया का छिड़काव करें और पानी की मात्रा कम करें।',
                        diagnosis: 'पोषक तत्व की कमी',
                        solution: 'आप प्रति एकड़ 20-30 किलोग्राम यूरिया का छिड़काव करें और पानी की मात्रा कम करें।',
                        urgency: 'तुरंत कार्यवाही करें'
                    };
                } else if (queryLower.includes('कीड़े') || queryLower.includes('pest')) {
                    responseData = {
                        type: 'diagnose',
                        text: 'आपकी फसल में पत्ती खाने वाले कीटों का हमला हुआ है। यह फसल को बहुत नुकसान पहुंचा सकता है। आप इमामेक्टिन बेंजोएट 5% एसजी का 250 ग्राम प्रति एकड़ के हिसाब से स्प्रे करें।',
                        diagnosis: 'कीट का हमला',
                        solution: 'आप इमामेक्टिन बेंजोएट 5% एसजी का 250 ग्राम प्रति एकड़ के हिसाब से स्प्रे करें।',
                        urgency: 'तुरंत कार्यवाही करें'
                    };
                } else if (queryLower.includes('सरकारी योजना') || queryLower.includes('govt scheme')) {
                    responseData = {
                        type: 'scheme',
                        text: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) योजना के तहत किसानों को ₹6,000 की वार्षिक सहायता मिलती है।',
                        schemeName: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
                        description: 'इस योजना के तहत, सरकार किसानों को ₹6,000 की वार्षिक सहायता तीन बराबर किस्तों में सीधे उनके बैंक खाते में देती है।',
                    };
                } else {
                    responseData = {
                        type: 'info',
                        text: 'माफ कीजिये, मुझे आपका प्रश्न समझ नहीं आया।',
                    };
                }
                resolve(responseData);
            }, 2000); // Simulate API delay
        });
    }
});
