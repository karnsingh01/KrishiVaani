document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const micBtn = document.getElementById('micBtn');
    const status = document.getElementById('status');
    const transcriptSection = document.getElementById('transcriptSection');
    const transcriptText = document.getElementById('transcript');
    const responseSection = document.getElementById('responseSection');
    const responseContent = document.getElementById('responseContent');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');
    const mandiSearch = document.getElementById('mandiSearch');
    const searchBtn = document.getElementById('searchBtn');
    const mandiResults = document.getElementById('mandiResults');
    const getWeatherBtn = document.getElementById('getWeatherBtn');
    const weatherReport = document.getElementById('weatherReport');
    
    let isListening = false;
    let recognition;

    // --- Section Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Deactivate all sections and links
            sections.forEach(sec => sec.classList.remove('active'));
            navLinks.forEach(nav => nav.classList.remove('active'));
            
            // Activate the clicked section and link
            const targetSection = document.querySelector(link.getAttribute('href'));
            if (targetSection) {
                targetSection.classList.add('active');
                link.classList.add('active');
            }
        });
    });

    // --- Voice Assistant (Home Section) ---
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN'; // Set to Hindi
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            status.textContent = 'बोलें...';
            micBtn.classList.add('listening');
            hideHomeSections();
        };

        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            transcriptText.textContent = result;
            transcriptSection.classList.remove('hidden');
            status.textContent = 'सोच रहा है...';
            micBtn.classList.remove('listening');
            micBtn.classList.add('thinking');
            getResponseFromAI(result);
        };

        recognition.onerror = (event) => {
            isListening = false;
            micBtn.classList.remove('listening', 'thinking');
            micBtn.classList.add('error');
            showError('माइक की अनुमति नहीं दी गई या कोई समस्या हुई।');
            status.textContent = 'माइक बटन दबाएं और बोलें';
        };

        recognition.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening', 'thinking', 'speaking', 'error');
            status.textContent = 'माइक बटन दबाएं और बोलें';
        };
    } else {
        micBtn.disabled = true;
        status.textContent = 'वॉइस असिस्टेंट आपके ब्राउज़र में समर्थित नहीं है।';
        showError('वॉइस असिस्टेंस आपके ब्राउज़र में समर्थित नहीं है।');
    }

    micBtn.addEventListener('click', () => {
        if (micBtn.disabled) return;
        if (!isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    });

    retryBtn.addEventListener('click', () => {
        hideHomeSections();
    });

    function hideHomeSections() {
        transcriptSection.classList.add('hidden');
        responseSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        responseContent.innerHTML = '';
        errorMessage.textContent = '';
    }

    function showError(message) {
        hideHomeSections();
        errorSection.classList.remove('hidden');
        errorMessage.textContent = message;
    }

    async function getResponseFromAI(query) {
        micBtn.classList.remove('thinking');
        micBtn.classList.add('speaking');
        status.textContent = 'जवाब दे रहा है...';
        
        try {
            const response = await mockAIAPI(query);
            micBtn.classList.remove('speaking');
            status.textContent = 'माइक बटन दबाएं और बोलें';
            displayResponse(response);
        } catch (err) {
            showError('AI से जवाब प्राप्त करने में समस्या हुई।');
            micBtn.classList.remove('speaking');
            status.textContent = 'माइक बटन दबाएं और बोलें';
        }
    }

    function displayResponse(response) {
        responseSection.classList.remove('hidden');
        responseContent.innerHTML = `<p>${response.text}</p>`;

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(response.text);
            utterance.lang = 'hi-IN';
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // Mock AI API Call
    function mockAIAPI(query) {
        const queryLower = query.toLowerCase();
        return new Promise((resolve) => {
            setTimeout(() => {
                let responseData;
                if (queryLower.includes('मौसम') || queryLower.includes('weather')) {
                    responseData = { text: 'आज का मौसम साफ रहेगा और तापमान 25°C है। अगले 24 घंटों में बारिश की कोई संभावना नहीं है।' };
                } else if (queryLower.includes('कीमत') || queryLower.includes('bhav')) {
                    responseData = { text: 'आज दिल्ली की आजादपुर मंडी में गेहूं का भाव ₹2,500 प्रति क्विंटल है। आप मंडी सेक्शन में और जानकारी देख सकते हैं।' };
                } else if (queryLower.includes('सरकारी योजना') || queryLower.includes('scheme')) {
                    responseData = { text: 'भारत सरकार ने किसानों के लिए कई योजनाएं शुरू की हैं, जैसे PM-KISAN और फसल बीमा योजना। आप योजनाओं वाले सेक्शन में इनके बारे में जान सकते हैं।' };
                } else {
                    responseData = { text: 'मैं आपकी फसल से जुड़ी समस्याओं और सरकारी योजनाओं पर जानकारी दे सकता हूँ।' };
                }
                resolve(responseData);
            }, 2000); // Simulate API delay
        });
    }

    // --- Mandi Section Logic ---
    const mandiPrices = {
        'गेहूं': '₹2,500/क्विंटल',
        'आलू': '₹1,500/क्विंटल',
        'टमाटर': '₹2,200/क्विंटल',
        'प्याज': '₹1,800/क्विंटल',
        'गोभी': '₹2,000/क्विंटल',
        'सेब': '₹8,000/क्विंटल',
        'अंगूर': '₹5,500/क्विंटल'
    };

    searchBtn.addEventListener('click', () => {
        const query = mandiSearch.value.trim().toLowerCase();
        mandiResults.innerHTML = ''; // Clear results

        if (query === '') {
            mandiResults.innerHTML = '<p>खोज करने के लिए ऊपर टाइप करें, या नीचे देखें:</p>' +
                                     document.getElementById('mandiList').outerHTML;
            return;
        }

        const found = Object.keys(mandiPrices).find(item => item.includes(query));

        if (found) {
            mandiResults.innerHTML = `
                <div class="mandi-data">
                    <h4>खोज परिणाम</h4>
                    <ul>
                        <li>${found}: ${mandiPrices[found]}</li>
                    </ul>
                </div>
            `;
        } else {
            mandiResults.innerHTML = '<p>कोई परिणाम नहीं मिला।</p>';
        }
    });

    // --- Weather Section Logic ---
    getWeatherBtn.addEventListener('click', () => {
        weatherReport.innerHTML = '<p>मौसम की जानकारी प्राप्त हो रही है...</p>';
        getWeatherReport().then(report => {
            weatherReport.innerHTML = report;
        });
    });

    async function getWeatherReport() {
        // This is a mock function. In a real app, you would use a weather API.
        const mockData = {
            today: {
                temp: '25°C',
                conditions: 'आज साफ और धूप वाला मौसम रहेगा।',
                wind: '10 km/h',
                humidity: '60%'
            },
            tomorrow: {
                temp: '26°C',
                conditions: 'कल आंशिक रूप से बादल छाए रहेंगे।',
                wind: '12 km/h',
                humidity: '55%'
            }
        };

        const todayReport = `
            <h4>आज का मौसम</h4>
            <p><strong>तापमान:</strong> ${mockData.today.temp}</p>
            <p><strong>स्थिति:</strong> ${mockData.today.conditions}</p>
            <p><strong>हवा:</strong> ${mockData.today.wind}</p>
            <p><strong>नमी:</strong> ${mockData.today.humidity}</p>
        `;
        return new Promise(resolve => setTimeout(() => resolve(todayReport), 1500));
    }
});
