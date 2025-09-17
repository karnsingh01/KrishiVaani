# KrishiVaani - Deployment Package

## 📁 Complete File Package for Download

### 🚀 Quick Setup Instructions:
1. Download all 3 files below
2. Create a new folder on your computer
3. Save all files in the same folder
4. Upload folder to Netlify, Vercel, or GitHub Pages
5. Open in Chrome/Edge and allow microphone permission

---

## 📄 File 1: index.html
Copy and save as `index.html`:

```html
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KrishiVaani - कृषि सहायक</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="title">🌾 KrishiVaani</h1>
            <p class="subtitle">आपका कृषि सहायक</p>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div class="system-status" id="systemStatus">
                <div class="status-item">
                    <span class="status-icon" id="httpsStatus">🔒</span>
                    <span class="status-text">HTTPS: <span id="httpsText">Checking...</span></span>
                </div>
                <div class="status-item">
                    <span class="status-icon" id="browserStatus">🌐</span>
                    <span class="status-text">Browser: <span id="browserText">Checking...</span></span>
                </div>
                <div class="status-item">
                    <span class="status-icon" id="micStatus">🎤</span>
                    <span class="status-text">Microphone: <span id="micText">Not tested</span></span>
                </div>
            </div>

            <div class="voice-card">
                <h2>🎤 आवाज़ से पूछें</h2>
                <p>फसल की समस्या, बाजार भाव, या मौसम के बारे में बताएं</p>
                
                <div class="mic-container">
                    <button class="mic-btn" id="micBtn">
                        <div class="mic-icon">🎤</div>
                        <div class="mic-pulse"></div>
                    </button>
                    <p class="status" id="status">माइक बटन दबाएं और बोलें</p>
                </div>

                <div class="transcript-section hidden" id="transcriptSection">
                    <h3>आपने कहा:</h3>
                    <p class="transcript" id="transcript">यहां आपके बोले गए शब्द दिखेंगे...</p>
                </div>

                <div class="response-section hidden" id="responseSection">
                    <h3>🤖 AI का जवाब:</h3>
                    <div class="response-content" id="responseContent"></div>
                </div>

                <div class="error-section hidden" id="errorSection">
                    <div class="error-content">
                        <h3>⚠️ समस्या</h3>
                        <p class="error-message" id="errorMessage"></p>
                        <button class="retry-btn" id="retryBtn">फिर कोशिश करें</button>
                    </div>
                </div>

                <div class="fallback-section hidden" id="fallbackSection">
                    <h3>📝 टाइप करके पूछें:</h3>
                    <div class="input-group">
                        <input type="text" class="text-input" id="textInput" placeholder="अपना प्रश्न यहां लिखें...">
                        <button class="send-btn" id="sendBtn">भेजें</button>
                    </div>
                </div>
            </div>

            <div class="quick-questions">
                <h3>जल्दी पूछें:</h3>
                <div class="question-grid">
                    <button class="question-btn" data-question="गेहूं की कीमत क्या है">गेहूं की कीमत</button>
                    <button class="question-btn" data-question="आज का मौसम कैसा है">आज का मौसम</button>
                    <button class="question-btn" data-question="पत्तियां पीली हो रही हैं">पत्तियां पीली</button>
                    <button class="question-btn" data-question="कीड़े लगे हैं फसल में">कीट की समस्या</button>
                </div>
            </div>

            <div class="help-section">
                <h3>📋 उदाहरण प्रश्न:</h3>
                <ul class="help-list">
                    <li>"मेरी फसल में पत्तियां पीली हो रही हैं"</li>
                    <li>"गेहूं की आज की कीमत क्या है?"</li>
                    <li>"आज का मौसम कैसा रहेगा?"</li>
                    <li>"कीड़े लगे हैं, क्या करूं?"</li>
                    <li>"यूरिया खाद कितनी डालनी चाहिए?"</li>
                </ul>
            </div>
        </div>
    </main>

    <script src="app.js"></script>
</body>
</html>
```

---

## 🎨 File 2: style.css  
Copy and save as `style.css`:

```css
:root {
  --background: #F7F9F2;
  --foreground: #222222;
  --card-bg: rgba(255, 255, 255, 0.95);
  --primary: #4CAF50;
  --primary-hover: #388E3C;
  --vibrant-green: #16a34a;
  --vibrant-yellow: #eab308;
  --vibrant-blue: #3b82f6;
  --light-green: #dcfce7;
  --light-yellow: #fef3c7;
  --light-blue: #dbeafe;
  --error-color: #ef4444;
  --success-color: #22c55e;
  --shadow: 0 8px 25px rgba(0,0,0,0.1);
  --shadow-hover: 0 12px 30px rgba(0,0,0,0.15);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', sans-serif;
  background-color: var(--background);
  background-image: url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=800&fit=crop&crop=center');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: var(--foreground);
  line-height: 1.6;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  color: white;
  padding: 2rem 0;
  text-align: center;
  box-shadow: var(--shadow);
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main {
  padding: 2rem 0;
}

.system-status {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.status-icon {
  font-size: 1.2rem;
}

.status-text {
  font-weight: 500;
}

.status-ready { color: var(--success-color); }
.status-error { color: var(--error-color); }
.status-warning { color: var(--vibrant-yellow); }

.voice-card {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
  padding: 2rem;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.voice-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.voice-card h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
  text-align: center;
}

.voice-card > p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  text-align: center;
}

.mic-container {
  text-align: center;
  margin: 2rem 0;
  position: relative;
}

.mic-btn {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--vibrant-green), var(--vibrant-blue));
  color: white;
  font-size: 3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.mic-btn:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-hover);
}

.mic-btn:active {
  transform: scale(0.95);
}

.mic-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.mic-btn.listening {
  animation: pulse 2s infinite;
  background: linear-gradient(135deg, var(--success-color), var(--vibrant-green));
}

.mic-btn.thinking {
  background: linear-gradient(135deg, var(--vibrant-yellow), var(--vibrant-blue));
  animation: rotate 1s linear infinite;
}

.mic-btn.speaking {
  background: linear-gradient(135deg, var(--vibrant-blue), var(--primary));
  animation: speak 0.5s ease-in-out infinite alternate;
}

.mic-btn.error {
  background: linear-gradient(135deg, var(--error-color), #dc2626);
  animation: shake 0.5s ease-in-out;
}

.mic-pulse {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 3px solid var(--vibrant-blue);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
}

.mic-btn.listening .mic-pulse {
  animation: pulseRing 1.5s ease-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes speak {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes pulseRing {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  80%, 100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.status {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary);
  text-align: center;
  min-height: 1.5rem;
}

.transcript-section,
.response-section,
.error-section,
.fallback-section {
  margin: 1.5rem 0;
  padding: 1.5rem;
  border-radius: 1rem;
}

.transcript-section {
  background: var(--light-blue);
  border-left: 4px solid var(--vibrant-blue);
}

.response-section {
  background: var(--light-green);
  border-left: 4px solid var(--vibrant-green);
}

.error-section {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid #fca5a5;
  text-align: center;
}

.fallback-section {
  background: var(--light-yellow);
  border-left: 4px solid var(--vibrant-yellow);
}

.transcript-section h3,
.response-section h3,
.fallback-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.transcript-section h3 { color: var(--vibrant-blue); }
.response-section h3 { color: var(--vibrant-green); }
.fallback-section h3 { color: var(--vibrant-yellow); }

.transcript {
  font-size: 1.2rem;
  color: var(--foreground);
  font-weight: 500;
  line-height: 1.5;
  min-height: 2rem;
}

.response-content {
  line-height: 1.6;
}

.diagnosis {
  background: rgba(59, 130, 246, 0.1);
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  border-left: 4px solid var(--vibrant-blue);
}

.solution {
  background: rgba(34, 197, 94, 0.1);
  padding: 1rem;
  border-radius: 0.75rem;
  border-left: 4px solid var(--vibrant-green);
}

.urgency {
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  border-left: 4px solid var(--error-color);
  color: var(--error-color);
  font-weight: 600;
}

.error-content h3 {
  color: var(--error-color);
  margin-bottom: 1rem;
}

.error-message {
  color: var(--error-color);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.retry-btn {
  background: var(--error-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.retry-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.send-btn {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.send-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.text-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.quick-questions {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.quick-questions h3 {
  color: var(--primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.question-btn {
  background: var(--light-green);
  border: 2px solid #bbf7d0;
  color: var(--foreground);
  padding: 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.question-btn:hover {
  background: var(--vibrant-green);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

.help-section {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.help-section h3 {
  color: var(--primary);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.help-list {
  list-style: none;
  padding: 0;
}

.help-list li {
  background: rgba(76, 175, 80, 0.1);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  border-left: 3px solid var(--primary);
  font-weight: 500;
}

.hidden {
  display: none !important;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .voice-card {
    padding: 1.5rem;
    border-radius: 1.5rem;
  }
  
  .mic-btn {
    width: 100px;
    height: 100px;
    font-size: 2.5rem;
  }
  
  .system-status {
    grid-template-columns: 1fr;
  }
  
  .question-grid {
    grid-template-columns: 1fr;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .send-btn {
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .voice-card {
    padding: 1rem;
    border-radius: 1rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .mic-btn {
    width: 90px;
    height: 90px;
    font-size: 2rem;
  }
}
```

---

## ⚡ File 3: Download JavaScript file separately
Due to length limitations, the JavaScript file (app.js) is provided as a separate download.

---

## 🚀 Quick Deployment Options:

### **Option 1: Netlify (Recommended)**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your folder with all 3 files
3. Get instant HTTPS URL

### **Option 2: Vercel**  
1. Go to [vercel.com](https://vercel.com)
2. Import from folder
3. Auto-deploy with HTTPS

### **Option 3: GitHub Pages**
1. Create GitHub repo
2. Upload all 3 files
3. Enable Pages in settings

---

## ✅ Testing Requirements:
- **Chrome or Edge** browser (latest version)
- **HTTPS** connection (automatic with hosting)
- **Allow microphone** permission when prompted
- **Speak clearly** in Hindi for best results

## 🎯 Voice Commands to Test:
- "मेरी फसल में पत्तियां पीली हो रही हैं"
- "गेहूं की कीमत क्या है?"
- "आज का मौसम कैसा है?"
- "कीड़े लगे हैं फसल में"