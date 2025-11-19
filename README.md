# 🚀 FileFlow - iOS-Style File Type Changer

A beautiful, modern file converter web application with an iOS-inspired design and Firebase backend integration.

![FileFlow](https://img.shields.io/badge/Status-Ready-success)
![Firebase](https://img.shields.io/badge/Backend-Firebase-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🎨 **Stunning iOS-Inspired UI** - Glassmorphic design with smooth animations
- 🔄 **File Conversion** - Support for Images, Documents, Audio, and Video files
- 📤 **Drag & Drop** - Intuitive file upload interface
- ☁️ **Firebase Integration** - Cloud storage and authentication
- 📊 **Conversion History** - Track all your conversions
- 📱 **Fully Responsive** - Works perfectly on all devices
- 🌙 **Dark Mode** - Beautiful dark theme with vibrant accents
- ⚡ **Real-time Progress** - Live conversion progress tracking

## 🎯 Supported File Types

### Images
- JPG, JPEG, PNG, GIF, WEBP, BMP, SVG, ICO, TIFF

### Documents
- PDF, DOC, DOCX, TXT, RTF, ODT, XLS, XLSX, PPT, PPTX

### Audio
- MP3, WAV, OGG, M4A, FLAC, AAC, WMA

### Video
- MP4, AVI, MOV, WMV, FLV, MKV, WEBM

## 🛠️ Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "FileFlow")
4. Follow the setup wizard

### Step 2: Enable Firebase Services

#### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Anonymous** authentication
4. Click "Save"

#### Enable Storage
1. Go to **Storage** in Firebase Console
2. Click "Get Started"
3. Start in **test mode** (for development)
4. Choose your storage location
5. Click "Done"

#### Update Storage Rules (Optional - for production)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /conversions/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** → Project Settings
2. Scroll down to "Your apps"
3. Click the **Web icon** (</>)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### Step 4: Update app.js

Open `app.js` and replace the Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

Replace with your actual values from Firebase Console.

## 🚀 Getting Started

### Option 1: Simple HTTP Server (Recommended for Testing)

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (install http-server globally first)
npx http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 2: Live Server (VS Code Extension)

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Direct File Opening

Simply open `index.html` in your browser. Note: Some features may be limited without a server.

## 📁 Project Structure

```
File Type Changer/
├── index.html          # Main HTML structure
├── styles.css          # iOS-inspired styling
├── app.js             # JavaScript logic & Firebase integration
└── README.md          # Documentation
```

## 🎨 Design Features

### Glassmorphism
- Frosted glass effect with backdrop blur
- Subtle borders and shadows
- Layered depth perception

### Animations
- Smooth page transitions
- Micro-interactions on hover
- Progress animations
- Success celebrations

### Color Palette
- Primary: Purple gradient (#667EEA → #764BA2)
- Secondary: Pink gradient (#F093FB → #F5576C)
- Success: Green gradient (#4ADE80 → #10B981)
- Dark theme with vibrant accents

## 🔧 Advanced Configuration

### Firebase Functions (Optional - for actual conversion)

For real file conversion, you'll need to set up Firebase Cloud Functions:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Functions:
```bash
firebase init functions
```

3. Create a conversion function in `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
// Add your conversion logic here
```

4. Deploy:
```bash
firebase deploy --only functions
```

### Storage Security Rules (Production)

Update your Storage rules for production:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /conversions/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 50 * 1024 * 1024; // 50MB limit
    }
  }
}
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🐛 Troubleshooting

### Firebase Not Initialized
**Error:** "Firebase configuration needed"
**Solution:** Update `firebaseConfig` in `app.js` with your Firebase credentials

### CORS Issues
**Error:** Cross-origin request blocked
**Solution:** Use a local server (http-server, Live Server, etc.) instead of opening the file directly

### Storage Upload Fails
**Error:** Upload permission denied
**Solution:** Check Firebase Storage rules and ensure authentication is enabled

### File Not Converting
**Note:** The current implementation simulates conversion. For actual conversion, implement Firebase Cloud Functions or use a third-party API.

## 🚀 Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize hosting:
```bash
firebase init hosting
```

4. Deploy:
```bash
firebase deploy --only hosting
```

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Deploy!

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

## 🎯 Future Enhancements

- [ ] Real file conversion using Cloud Functions
- [ ] User authentication and profiles
- [ ] Batch file conversion
- [ ] Custom conversion settings
- [ ] Download history as ZIP
- [ ] Share converted files
- [ ] API integration for advanced conversions
- [ ] PWA support for offline usage

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 💡 Tips

1. **Test Mode:** The app works in demo mode without Firebase configuration
2. **File Size:** Keep files under 50MB for optimal performance
3. **Formats:** Currently simulates conversion - implement actual conversion logic for production
4. **History:** Stored in localStorage - clears when browser data is cleared

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review Firebase documentation
- Open an issue on GitHub

---

**Built with ❤️ using Firebase and modern web technologies**
