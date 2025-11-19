// ===================================
// FIREBASE CONFIGURATION
// ===================================
// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, storage, auth;
try {
    app = firebase.initializeApp(firebaseConfig);
    storage = firebase.storage();
    auth = firebase.auth();
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    showToast('Firebase configuration needed. Please update firebaseConfig in app.js', 'error');
}

// ===================================
// FILE TYPE MAPPINGS
// ===================================
const fileTypeCategories = {
    image: {
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'tiff'],
        icon: '🖼️',
        color: '#667EEA'
    },
    document: {
        extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'],
        icon: '📄',
        color: '#F093FB'
    },
    audio: {
        extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'],
        icon: '🎵',
        color: '#10B981'
    },
    video: {
        extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
        icon: '🎬',
        color: '#F5576C'
    }
};

// ===================================
// STATE MANAGEMENT
// ===================================
const state = {
    currentFile: null,
    selectedFormat: null,
    currentView: 'converter',
    conversionHistory: []
};

// ===================================
// DOM ELEMENTS
// ===================================
const elements = {
    uploadArea: document.getElementById('upload-area'),
    fileInput: document.getElementById('file-input'),
    conversionPanel: document.getElementById('conversion-panel'),
    fileName: document.getElementById('file-name'),
    fileSize: document.getElementById('file-size'),
    fileIcon: document.getElementById('file-icon'),
    removeFile: document.getElementById('remove-file'),
    formatGrid: document.getElementById('format-grid'),
    convertBtn: document.getElementById('convert-btn'),
    progressContainer: document.getElementById('progress-container'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    downloadSection: document.getElementById('download-section'),
    downloadBtn: document.getElementById('download-btn'),
    newConversionBtn: document.getElementById('new-conversion-btn'),
    historyList: document.getElementById('history-list'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    navBtns: document.querySelectorAll('.nav-btn'),
    views: document.querySelectorAll('.view')
};

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadConversionHistory();
    
    // Sign in anonymously for Firebase
    if (auth) {
        auth.signInAnonymously()
            .then(() => console.log('✅ Signed in anonymously'))
            .catch(error => console.error('❌ Auth error:', error));
    }
});

// ===================================
// EVENT LISTENERS
// ===================================
function initializeEventListeners() {
    // Upload area events
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    
    // File input
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Remove file
    elements.removeFile.addEventListener('click', (e) => {
        e.stopPropagation();
        resetConverter();
    });
    
    // Convert button
    elements.convertBtn.addEventListener('click', handleConversion);
    
    // Download button
    elements.downloadBtn.addEventListener('click', handleDownload);
    
    // New conversion button
    elements.newConversionBtn.addEventListener('click', resetConverter);
    
    // Navigation
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
}

// ===================================
// DRAG & DROP HANDLERS
// ===================================
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// ===================================
// FILE PROCESSING
// ===================================
function processFile(file) {
    state.currentFile = file;
    
    // Update UI
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    
    // Show conversion panel
    elements.uploadArea.style.display = 'none';
    elements.conversionPanel.style.display = 'block';
    
    // Get file category and populate formats
    const fileExtension = getFileExtension(file.name);
    const category = getFileCategory(fileExtension);
    
    if (category) {
        populateFormatOptions(category, fileExtension);
    } else {
        showToast('File type not supported', 'error');
        resetConverter();
    }
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function getFileCategory(extension) {
    for (const [category, data] of Object.entries(fileTypeCategories)) {
        if (data.extensions.includes(extension)) {
            return category;
        }
    }
    return null;
}

function populateFormatOptions(category, currentExtension) {
    const formats = fileTypeCategories[category].extensions.filter(ext => ext !== currentExtension);
    
    elements.formatGrid.innerHTML = '';
    
    formats.forEach(format => {
        const option = document.createElement('div');
        option.className = 'format-option';
        option.textContent = format.toUpperCase();
        option.dataset.format = format;
        
        option.addEventListener('click', () => {
            document.querySelectorAll('.format-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            state.selectedFormat = format;
            elements.convertBtn.disabled = false;
        });
        
        elements.formatGrid.appendChild(option);
    });
    
    // Disable convert button until format is selected
    elements.convertBtn.disabled = true;
}

// ===================================
// FILE CONVERSION
// ===================================
async function handleConversion() {
    if (!state.currentFile || !state.selectedFormat) {
        showToast('Please select a format', 'error');
        return;
    }
    
    // Hide convert button and show progress
    elements.convertBtn.style.display = 'none';
    elements.progressContainer.style.display = 'block';
    
    try {
        // Simulate conversion process (In production, use Firebase Functions)
        await simulateConversion();
        
        // Upload to Firebase Storage
        if (storage) {
            await uploadToFirebase();
        }
        
        // Show download section
        elements.progressContainer.style.display = 'none';
        elements.downloadSection.style.display = 'block';
        
        // Add to history
        addToHistory();
        
        showToast('Conversion completed successfully!', 'success');
    } catch (error) {
        console.error('Conversion error:', error);
        showToast('Conversion failed. Please try again.', 'error');
        resetConverter();
    }
}

async function simulateConversion() {
    // Simulate conversion progress
    for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        elements.progressFill.style.width = `${i}%`;
        elements.progressText.textContent = `Converting... ${i}%`;
    }
}

async function uploadToFirebase() {
    if (!storage || !state.currentFile) return;
    
    const timestamp = Date.now();
    const originalName = state.currentFile.name.split('.')[0];
    const newFileName = `${originalName}_converted_${timestamp}.${state.selectedFormat}`;
    const storageRef = storage.ref(`conversions/${newFileName}`);
    
    try {
        // Upload file
        const snapshot = await storageRef.put(state.currentFile);
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        state.downloadURL = downloadURL;
        state.convertedFileName = newFileName;
        
        console.log('✅ File uploaded to Firebase:', downloadURL);
    } catch (error) {
        console.error('❌ Firebase upload error:', error);
        // Continue even if Firebase upload fails (for demo purposes)
    }
}

// ===================================
// DOWNLOAD HANDLER
// ===================================
function handleDownload() {
    if (state.downloadURL) {
        // Download from Firebase
        window.open(state.downloadURL, '_blank');
    } else {
        // Fallback: Create a blob and download (demo mode)
        const blob = new Blob([state.currentFile], { type: state.currentFile.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${state.selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showToast('Download started!', 'success');
}

// ===================================
// HISTORY MANAGEMENT
// ===================================
function addToHistory() {
    const historyItem = {
        id: Date.now(),
        originalName: state.currentFile.name,
        convertedFormat: state.selectedFormat,
        size: state.currentFile.size,
        timestamp: new Date().toISOString(),
        downloadURL: state.downloadURL || null
    };
    
    state.conversionHistory.unshift(historyItem);
    
    // Save to localStorage
    localStorage.setItem('conversionHistory', JSON.stringify(state.conversionHistory));
    
    // Update history view
    renderHistory();
}

function loadConversionHistory() {
    const saved = localStorage.getItem('conversionHistory');
    if (saved) {
        state.conversionHistory = JSON.parse(saved);
        renderHistory();
    }
}

function renderHistory() {
    if (state.conversionHistory.length === 0) {
        elements.historyList.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="rgba(102, 126, 234, 0.2)" stroke-width="2" stroke-dasharray="4 4"/>
                    <path d="M40 20V60M40 60L30 50M40 60L50 50" stroke="rgba(102, 126, 234, 0.4)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3 class="empty-title">No conversions yet</h3>
                <p class="empty-subtitle">Your conversion history will appear here</p>
            </div>
        `;
        return;
    }
    
    elements.historyList.innerHTML = state.conversionHistory.map(item => `
        <div class="history-item" style="animation-delay: ${state.conversionHistory.indexOf(item) * 0.05}s">
            <div class="history-icon">
                <svg viewBox="0 0 48 48" fill="none">
                    <path d="M28 4H12C10.9 4 10 4.9 10 6V42C10 43.1 10.9 44 12 44H36C37.1 44 38 43.1 38 42V16L28 4Z" fill="url(#file-gradient-${item.id})"/>
                    <defs>
                        <linearGradient id="file-gradient-${item.id}" x1="10" y1="4" x2="38" y2="44">
                            <stop stop-color="#667EEA"/>
                            <stop offset="1" stop-color="#764BA2"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div class="history-info">
                <h4 class="history-name">${item.originalName} → ${item.convertedFormat.toUpperCase()}</h4>
                <p class="history-meta">${formatFileSize(item.size)} • ${formatDate(item.timestamp)}</p>
            </div>
            <button class="history-download" onclick="downloadHistoryItem(${item.id})">
                Download
            </button>
        </div>
    `).join('');
}

function downloadHistoryItem(id) {
    const item = state.conversionHistory.find(i => i.id === id);
    if (item && item.downloadURL) {
        window.open(item.downloadURL, '_blank');
        showToast('Download started!', 'success');
    } else {
        showToast('Download URL not available', 'error');
    }
}

// ===================================
// VIEW SWITCHING
// ===================================
function switchView(viewName) {
    state.currentView = viewName;
    
    // Update navigation
    elements.navBtns.forEach(btn => {
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update views
    elements.views.forEach(view => {
        if (view.id === `${viewName}-view`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });
    
    // Refresh history if switching to history view
    if (viewName === 'history') {
        renderHistory();
    }
}

// ===================================
// RESET CONVERTER
// ===================================
function resetConverter() {
    state.currentFile = null;
    state.selectedFormat = null;
    state.downloadURL = null;
    
    elements.uploadArea.style.display = 'block';
    elements.conversionPanel.style.display = 'none';
    elements.convertBtn.style.display = 'flex';
    elements.progressContainer.style.display = 'none';
    elements.downloadSection.style.display = 'none';
    elements.fileInput.value = '';
    elements.formatGrid.innerHTML = '';
    elements.progressFill.style.width = '0%';
}

// ===================================
// TOAST NOTIFICATIONS
// ===================================
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

// ===================================
// GLOBAL FUNCTIONS (for inline onclick)
// ===================================
window.downloadHistoryItem = downloadHistoryItem;
