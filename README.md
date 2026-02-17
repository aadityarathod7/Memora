# Memora - Your AI-Powered Journal Companion

<div align="center">

**"Where memories talk back..."**

A beautiful, intelligent journaling application that listens, remembers, and responds like a human friend.

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Documentation](#documentation) • [Screenshots](#screenshots)

</div>

---

## 📖 Overview

**Memora** (formerly Book Companion) is a modern, AI-powered journaling application that combines the intimacy of traditional journaling with the intelligence of AI. It's designed to be your personal companion, helping you reflect on your thoughts, track your moods, and gain insights from your daily experiences.

### Why Memora?

- **Conversational AI**: Memora doesn't just store your entries—it responds thoughtfully, asks meaningful questions, and helps you explore your thoughts deeper
- **Beautiful Book-Themed UI**: Inspired by classic leather-bound journals with elegant serif fonts, gold accents, and paper textures
- **Privacy-First**: Your memories are precious and personal—all data is securely stored and never shared
- **Mood Tracking**: Visualize your emotional journey with interactive heatmaps and trend analysis
- **Smart Features**: Voice recording, location tagging, reflection questions, and more
- **Fully Responsive**: Perfect experience on desktop, tablet, and mobile devices

---

## ✨ Features

### Core Journaling
- **📝 Rich Text Entries**: Write freely with a beautiful handwritten-style interface
- **🎙️ Voice Recording**: Transcribe your thoughts using speech-to-text
- **📍 Location Tagging**: Remember where you were when you wrote each entry
- **🏷️ Custom Tags**: Organize entries with personalized tags
- **⭐ Favorites & Pins**: Mark important entries for quick access
- **🔍 Advanced Search**: Find entries by content, date, mood, tags, or location

### AI-Powered Features
- **🤖 Intelligent Responses**: AI reads your entries and responds with empathy and insight
- **💬 Conversational Threads**: Continue the conversation with back-and-forth dialogue
- **❓ Reflection Questions**: AI suggests thoughtful questions to deepen your journaling
- **📊 Insights**: AI-generated summaries and pattern recognition

### Mood & Analytics
- **😊 Mood Tracking**: 10 different moods with beautiful icons
- **🔥 Mood Heatmap**: GitHub-style calendar showing your emotional patterns over the year
- **📈 Emotion Trends**: Line charts tracking mood changes over time
- **📅 Monthly/Weekly Summaries**: AI-generated summaries of your journaling patterns
- **🎯 Streak Tracking**: Monitor your journaling consistency

### Organization & Discovery
- **📆 Calendar View**: Browse entries by date
- **⏱️ Timeline View**: Chronological journey through your entries
- **🔖 On This Day**: Revisit entries from past years on the same date
- **📌 Pinned Entries**: Keep important entries at the top
- **💝 Favorites**: Collect meaningful moments

### Personalization
- **🎨 Themes**: Forest, Ocean, Sunset, Lavender, and Midnight themes
- **🌓 Dark Mode**: Easy on the eyes for night journaling
- **✍️ Font Styles**: Default, Handwritten, Classic, or Modern fonts
- **🏷️ Custom Tags**: Create your own organizational system

### Privacy & Security
- **🔐 PIN Lock**: Optional 4-6 digit PIN protection for sensitive entries
- **🔒 Secure Authentication**: JWT-based auth with bcrypt password hashing
- **👤 Private by Default**: No public profiles or social features

### Smart Reminders
- **⏰ Daily Reminders**: Customizable email reminders to maintain your journaling habit
- **🔔 Streak Protection**: Get notified before breaking your streak
- **📧 Email Notifications**: Beautiful HTML email templates

### Data Export & Backup
- **💾 Export Options**: Download your journal as JSON, Markdown, or CSV
- **📦 Full Backup**: Export all entries with metadata and conversations
- **🌐 Offline Support**: Write entries even without internet connection

### Mobile Experience
- **📱 Fully Responsive**: Optimized for all screen sizes
- **👆 Touch-Friendly**: 44px minimum tap targets following iOS/Android guidelines
- **🔄 Pull to Refresh**: Natural mobile interactions
- **👈 Swipe Navigation**: Swipe between entries on mobile
- **📲 PWA-Ready**: Can be installed as a mobile app

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization for analytics
- **Vite** - Lightning-fast build tool
- **Axios** - HTTP client

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - NoSQL database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **OpenAI API** - AI-powered responses
- **Nodemailer** - Email service
- **Node-cron** - Scheduled tasks
- **Multer** - File uploads

### Development Tools
- **ESLint** - Code linting
- **Git** - Version control
- **dotenv** - Environment management

---

## 📦 Installation

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local or Atlas)
- **OpenAI API Key** (for AI features)
- **Gmail Account** (for email reminders, optional)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/memora.git
cd memora
```

2. **Install dependencies**

Frontend:
```bash
cd client
npm install
```

Backend:
```bash
cd ../server
npm install
```

3. **Environment Configuration**

Create `server/.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/memora

# Authentication
JWT_SECRET=your_jwt_secret_key_min_32_characters

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Email (optional - for reminders)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Google OAuth (optional - for future features)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-drive/callback

# Frontend URL
CLIENT_URL=http://localhost:3000
```

Create `client/.env` (optional):
```env
VITE_API_URL=http://localhost:5000
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

5. **Run the application**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

6. **Access the app**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
bookcompanion/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── AdvancedSearchPanel.jsx
│   │   │   ├── AudioRecorder.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── EmotionTrendsPanel.jsx
│   │   │   ├── GoalsPanel.jsx
│   │   │   ├── LocationPicker.jsx
│   │   │   ├── MoodHeatmap.jsx
│   │   │   ├── MonthlySummaryPanel.jsx
│   │   │   ├── OnThisDayPanel.jsx
│   │   │   ├── PINLock.jsx
│   │   │   ├── PromptsPanel.jsx
│   │   │   ├── ReflectionQuestions.jsx
│   │   │   ├── ReminderSettings.jsx
│   │   │   ├── SettingsPanel.jsx
│   │   │   ├── StatsPanel.jsx
│   │   │   ├── TimelineView.jsx
│   │   │   ├── VoiceRecorder.jsx
│   │   │   └── WeeklySummaryPanel.jsx
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── ThemeContext.jsx     # Theme management
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Signup.jsx           # Registration page
│   │   │   ├── ForgotPassword.jsx   # Password reset request
│   │   │   ├── ResetPassword.jsx    # Password reset form
│   │   │   └── Journal.jsx          # Main journaling interface
│   │   ├── services/                # API services
│   │   │   ├── api.js               # API client
│   │   │   └── offlineStorage.js    # Offline functionality
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── vite.config.js               # Vite configuration
│
├── server/                          # Backend Node.js application
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/                 # Request handlers
│   │   ├── authController.js        # Authentication logic
│   │   └── entryController.js       # Entry CRUD operations
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js                  # User model
│   │   └── Entry.js                 # Journal entry model
│   ├── routes/                      # Express routes
│   │   ├── authRoutes.js            # Auth endpoints
│   │   └── entryRoutes.js           # Entry endpoints
│   ├── services/                    # Business logic
│   │   ├── aiService.js             # OpenAI integration
│   │   ├── emailService.js          # Email sending
│   │   ├── reminderScheduler.js     # Cron jobs for reminders
│   │   └── offlineSync.js           # Offline sync handling
│   ├── utils/
│   │   └── validators.js            # Input validation
│   ├── server.js                    # Express app setup
│   └── package.json
│
└── README.md                        # This file
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Settings
```http
PUT /api/auth/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "forest",
  "darkMode": false,
  "font": "handwritten"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### Entry Endpoints

#### Create Entry
```http
POST /api/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Today was a great day...",
  "title": "A Great Day",
  "mood": "happy",
  "tags": ["work", "achievement"],
  "location": {
    "name": "New York, USA",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
}
```

#### Get All Entries
```http
GET /api/entries
Authorization: Bearer <token>
```

#### Get Single Entry
```http
GET /api/entries/:id
Authorization: Bearer <token>
```

#### Update Entry
```http
PUT /api/entries/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated content...",
  "mood": "calm"
}
```

#### Delete Entry
```http
DELETE /api/entries/:id
Authorization: Bearer <token>
```

#### Reply to Entry (AI Conversation)
```http
POST /api/entries/:id/reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Tell me more about that experience"
}
```

#### Toggle Favorite
```http
POST /api/entries/:id/favorite
Authorization: Bearer <token>
```

#### Toggle Pin
```http
POST /api/entries/:id/pin
Authorization: Bearer <token>
```

#### Update Tags
```http
PUT /api/entries/:id/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tags": ["personal", "reflection"]
}
```

### Analytics Endpoints

#### Get Writing Stats
```http
GET /api/entries/stats/writing
Authorization: Bearer <token>
```

#### Get Mood Analytics
```http
GET /api/entries/stats/mood?period=month
Authorization: Bearer <token>
```

#### Get Monthly Summary
```http
GET /api/entries/summary/month?month=11&year=2024
Authorization: Bearer <token>
```

#### Get Weekly Summary
```http
GET /api/entries/summary/week
Authorization: Bearer <token>
```

#### Get Emotion Trends
```http
GET /api/entries/trends/emotion?period=month
Authorization: Bearer <token>
```

### Export Endpoints

#### Export Entries
```http
POST /api/entries/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "json" // or "markdown" or "csv"
}
```

### Tag Management

#### Get Custom Tags
```http
GET /api/entries/tags
Authorization: Bearer <token>
```

#### Add Custom Tag
```http
POST /api/entries/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tag": "gratitude"
}
```

#### Delete Custom Tag
```http
DELETE /api/entries/tags/:tag
Authorization: Bearer <token>
```

### Reminder Endpoints

#### Update Reminder Settings
```http
PUT /api/auth/reminders
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "time": "20:00",
  "frequency": "daily",
  "days": [1, 2, 3, 4, 5] // 0=Sunday, 6=Saturday
}
```

---

## 🎨 Components Documentation

### Key Components

#### `Journal.jsx` - Main Application
The core journaling interface with entry list, conversation view, and all features.

**Key Features:**
- Entry creation and editing
- AI conversation threads
- Mobile-responsive overlays
- Swipe navigation
- Pull-to-refresh

#### `MoodHeatmap.jsx` - Mood Calendar
GitHub-style heatmap showing mood patterns throughout the year.

**Props:**
- `onClose: () => void` - Close handler

**Features:**
- 365-day grid view
- Hover tooltips
- Monthly labels
- Responsive design

#### `StatsPanel.jsx` - Analytics Dashboard
Displays writing statistics and mood breakdowns.

**Props:**
- `onClose: () => void` - Close handler

**Metrics:**
- Total entries
- Words written
- Current streak
- Average words per entry
- Mood distribution pie chart

#### `AdvancedSearchPanel.jsx` - Search Interface
Full-text search with filters.

**Props:**
- `onClose: () => void` - Close handler
- `onSelectEntry: (entry) => void` - Entry selection callback

**Features:**
- Text search
- Date range filtering
- Mood filtering
- Tag filtering

#### `VoiceRecorder.jsx` - Speech-to-Text
Records voice and transcribes to text.

**Props:**
- `onTranscript: (text) => void` - Transcription callback
- `disabled: boolean` - Disable recording

#### `LocationPicker.jsx` - Geolocation
Gets user's location using browser geolocation API.

**Props:**
- `onLocationUpdate: (location) => void` - Location callback

**Returns:**
- City, Country format (e.g., "Indore, India")
- Coordinates (lat/lng)

#### `PINLock.jsx` - Security Component
PIN entry and management for app security.

**Modes:**
- Setup PIN
- Verify PIN
- Change PIN

### Context Providers

#### `AuthContext.jsx`
Manages authentication state globally.

**Provided Values:**
```javascript
{
  user: User | null,
  token: string | null,
  loading: boolean,
  login: (email, password) => Promise,
  signup: (name, email, password) => Promise,
  logout: () => void,
  updateUser: (userData) => void
}
```

#### `ThemeContext.jsx`
Manages theme and appearance settings.

**Provided Values:**
```javascript
{
  theme: string,
  darkMode: boolean,
  font: string,
  setTheme: (theme) => void,
  setDarkMode: (enabled) => void,
  setFont: (font) => void
}
```

---

## 🎯 Usage Guide

### Getting Started

1. **Sign Up**: Create your account with name, email, and password
2. **First Entry**: Click "New Entry" to write your first journal entry
3. **AI Response**: Memora will read your entry and respond thoughtfully
4. **Continue Conversation**: Reply to continue the dialogue
5. **Track Moods**: Select how you're feeling with each entry
6. **Organize**: Add tags and use favorites/pins

### Writing Tips

- **Be Authentic**: Write naturally, as if talking to a friend
- **Use Voice**: Try voice recording for a more natural flow
- **Add Context**: Include location and mood for richer memories
- **Reflect**: Use AI-suggested reflection questions to go deeper

### Best Practices

- **Daily Habit**: Set up reminders to journal consistently
- **Explore Features**: Try calendar view, heatmap, and analytics
- **Export Regularly**: Back up your journal periodically
- **Use Tags**: Create a tagging system that works for you
- **Review Past Entries**: Use "On This Day" to revisit memories

---

## ⚙️ Configuration

### Theme Customization

Available themes in `client/src/index.css`:
- **Forest** (default): Green and earthy tones
- **Ocean**: Blue and aqua tones
- **Sunset**: Warm orange and pink tones
- **Lavender**: Purple and soft tones
- **Midnight**: Dark blue and muted tones

### Font Options
- **Default**: EB Garamond (elegant serif)
- **Handwritten**: Caveat (casual script)
- **Classic**: Georgia (traditional serif)
- **Modern**: Inter (clean sans-serif)

### AI Configuration

The AI behavior can be customized in `server/services/aiService.js`:

```javascript
// Adjust AI personality
const systemPrompt = `You are Memora, a thoughtful and empathetic journal companion...`;

// Change response length
max_tokens: 500

// Adjust creativity
temperature: 0.7
```

### Email Templates

Customize email templates in `server/services/emailService.js`:
- Reminder emails
- Password reset emails
- Streak protection emails

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
cd client
npm run build
```

2. Deploy the `dist` folder to Vercel or Netlify

3. Set environment variable:
```
VITE_API_URL=https://your-backend-url.com
```

### Backend Deployment (Railway/Heroku/DigitalOcean)

1. Prepare for production:
```bash
cd server
npm install --production
```

2. Set all environment variables on your hosting platform

3. Use MongoDB Atlas for database

4. Deploy using platform-specific instructions

### Docker Deployment (Optional)

Create `Dockerfile` in root:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Test Email Service
```bash
cd server
node test-reminder.js
```

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: MongoDB connection error
```
Solution: Ensure MongoDB is running or check Atlas connection string
```

**Problem**: AI responses not working
```
Solution: Verify OPENAI_API_KEY is set correctly in .env
```

**Problem**: Emails not sending
```
Solution: Use Gmail app-specific password, not regular password
```

**Problem**: Mobile layout issues
```
Solution: Clear browser cache and hard refresh (Cmd+Shift+R)
```

---

## 📱 Mobile Optimization

The app is fully optimized for mobile devices:

✅ **Responsive Design**
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg)
- All components adapt to screen size

✅ **Touch-Friendly**
- 44px minimum tap targets (iOS/Android standard)
- Swipe gestures for navigation
- Pull-to-refresh support

✅ **Performance**
- Lazy loading components
- Optimized images and fonts
- Minimal bundle size

✅ **PWA-Ready**
- Can be installed as mobile app
- Offline functionality
- App-like experience

---

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **PIN Lock**: Optional app-level security
- **HTTPS Only**: Force secure connections in production
- **Input Validation**: Prevent injection attacks
- **Rate Limiting**: Prevent brute force attacks
- **CORS Protection**: Configured allowed origins

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test on mobile devices
- Update documentation
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** - For GPT-based AI responses
- **Lucide Icons** - Beautiful icon library
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library
- **MongoDB** - Database
- **All contributors** - Thank you!

---

## 📧 Contact

For questions, suggestions, or support:
- **Email**: memorabookapp@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/memora/issues)

---

## 🗺️ Roadmap

### Planned Features

- [ ] Google Drive automatic backup
- [ ] Spotify integration for mood-based music
- [ ] Export to PDF with custom formatting
- [ ] Dark mode improvements
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Voice journaling (audio storage)
- [ ] Photos and media attachments
- [ ] Goals and habit tracking integration
- [ ] Share entries (encrypted links)
- [ ] Collaboration features
- [ ] Advanced analytics and insights

---

<div align="center">

**Made with ❤️ by the Memora Team**

*Every memory deserves to be remembered.*

</div>
