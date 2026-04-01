// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const nextBtn = document.getElementById('next-btn');
const bluetoothStatusSpan = document.getElementById('bluetooth-status');
const musicStatusSpan = document.getElementById('music-status');

// Speech recognition (if supported)
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

// Text-to-speech
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.2; // slightly robotic
        utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes('Google UK English Male'));
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }
}

// Add a message to chat
function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.classList.add('message', isUser ? 'user' : 'ai');
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message to API
async function sendToAI(userMessage) {
    addMessage(userMessage, true);

    // Show typing indicator (optional)
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'ai');
    typingDiv.textContent = '...';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch(`https://thenuxai-gpt.vercel.app/api/gpt?q=${encodeURIComponent(userMessage)}&model=gpt4`);
        const data = await response.json();
        const aiReply = data.response;

        // Remove typing indicator
        chatMessages.removeChild(typingDiv);

        addMessage(aiReply, false);
        speak(aiReply);
    } catch (error) {
        console.error(error);
        chatMessages.removeChild(typingDiv);
        addMessage('Error: Could not reach AI.', false);
        speak('Connection error.');
    }
}

// Handle voice input
function startVoiceInput() {
    if (!recognition) {
        alert('Speech recognition not supported in this browser.');
        return;
    }
    recognition.start();
    voiceBtn.style.opacity = '0.5';
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendToAI(transcript);
        voiceBtn.style.opacity = '1';
    };
    recognition.onerror = () => {
        voiceBtn.style.opacity = '1';
    };
    recognition.onend = () => {
        voiceBtn.style.opacity = '1';
    };
}

// Music controls using Media Session API (requires user interaction first)
let mediaSession = null;
if ('mediaSession' in navigator) {
    mediaSession = navigator.mediaSession;
}

function updateMusicStatus() {
    // This is a placeholder – actual status would come from Media Session events
    musicStatusSpan.textContent = 'Active';
}

function playPause() {
    // Simulate media control – you could send commands to a media player or use Media Session
    if (mediaSession) {
        mediaSession.playbackState = mediaSession.playbackState === 'playing' ? 'paused' : 'playing';
        musicStatusSpan.textContent = mediaSession.playbackState === 'playing' ? 'Playing' : 'Paused';
    } else {
        musicStatusSpan.textContent = 'Toggled';
    }
}

function nextTrack() {
    if (mediaSession) {
        // This would only work if you have a media element and are using MediaSession properly
        musicStatusSpan.textContent = 'Next';
    } else {
        musicStatusSpan.textContent = 'Next';
    }
}

// Bluetooth status – web cannot directly detect car Bluetooth, but you can simulate or use Web Bluetooth API with user consent
function checkBluetooth() {
    // Placeholder – you could request a Bluetooth device and listen for disconnections
    bluetoothStatusSpan.textContent = 'Unknown';
}

// Event listeners
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) {
        sendToAI(text);
        userInput.value = '';
    }
});
voiceBtn.addEventListener('click', startVoiceInput);
playPauseBtn.addEventListener('click', playPause);
nextBtn.addEventListener('click', nextTrack);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});

// Initial statuses
checkBluetooth();
musicStatusSpan.textContent = 'Inactive';
