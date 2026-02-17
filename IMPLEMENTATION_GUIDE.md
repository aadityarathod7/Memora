# Memora - Feature Implementation Guide

## ✅ Completed Features

### 1. Export & Backup ✓
**Backend:** Implemented in `server/controllers/entryController.js`
- ✅ JSON export
- ✅ Markdown export
- ✅ CSV export
- ✅ Full backup with user settings

**API Routes:** Added to `server/routes/entryRoutes.js`
- `/api/entries/export?format=json|markdown|csv`
- `/api/entries/backup`

**Frontend:** Added to `client/src/services/api.js`
- `exportEntries(format)` - Downloads file
- `createBackup()` - Downloads full backup

**TODO:** Add UI buttons to Settings Panel

---

## 🚧 In Progress

### 2. Rich Text Editor
**Status:** Not started
**Recommended:** Tiptap (modern, extensible)

**Implementation Plan:**
```bash
cd client
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

**Steps:**
1. Create `client/src/components/RichTextEditor.jsx`
2. Replace textarea in EntryForm with RichTextEditor
3. Update Entry model to store HTML content
4. Add `contentHtml` field to Entry schema
5. Backward compatibility: keep `content` for plain text

---

### 3. Image Upload & Gallery
**Status:** Partial (has images field, no upload)

**Implementation Plan:**
```bash
cd server
npm install multer sharp cloudinary
```

**Steps:**
1. Set up Cloudinary account (free tier: 25GB storage)
2. Add image upload route `/api/entries/:id/upload-image`
3. Use `multer` for file upload
4. Use `sharp` for compression
5. Upload to Cloudinary
6. Create image gallery component
7. Add drag & drop support

---

### 4. Advanced AI Features
**Status:** Not started

**Features to implement:**
- Monthly AI summaries
- Emotion trend analysis
- Pattern detection
- Growth tracking

**Implementation Plan:**
```javascript
// In server/controllers/entryController.js
export const generateMonthlySummary = async (req, res) => {
  // Get entries from last month
  // Use AI to analyze:
  // - Dominant emotions
  // - Recurring themes
  // - Personal growth insights
  // - Recommendations
};
```

---

### 6. Reminders & Notifications
**Status:** Model exists, not implemented

**Steps:**
1. Install `node-cron` for scheduled tasks
2. Install `nodemailer` for emails
3. Create `/api/auth/reminders` endpoint
4. Implement daily reminder job
5. Add Web Push API for browser notifications
6. Create notification UI in client

**Implementation:**
```bash
cd server
npm install node-cron nodemailer
```

---

### 7. Goals & Challenges
**Status:** Not started

**New collections needed:**
- `Goal` model (type, target, progress, deadline)
- `Challenge` model (name, duration, participants)

**Features:**
- 30-day writing challenge
- Word count goals
- Mood improvement goals
- Consistency goals

---

### 8. Better Mobile Experience
**Status:** Not started

**Improvements:**
- Pull-to-refresh
- Swipe gestures (delete, favorite)
- Better touch targets
- Bottom sheet modals
- Haptic feedback

**Libraries:**
```bash
cd client
npm install react-swipeable react-spring
```

---

### 10. Advanced Search & Filters
**Status:** Basic search exists

**Enhancements needed:**
- Date range picker
- Multi-mood filter
- Multi-tag filter
- Full-text search with highlighting
- Saved searches
- Search history

---

### 12. Performance Optimizations
**Status:** Partial pagination

**TODO:**
1. Add database indexes:
```javascript
// In Entry.js model
entrySchema.index({ user: 1, createdAt: -1 });
entrySchema.index({ user: 1, mood: 1 });
entrySchema.index({ user: 1, tags: 1 });
entrySchema.index({ user: 1, isFavorite: 1 });
```

2. Lazy load images
3. Virtual scrolling for long lists
4. Memoize expensive components
5. Code splitting

---

### 13. Security Improvements
**Status:** Basic JWT auth

**TODO:**
1. **Password Reset:**
```bash
npm install crypto
```
- Add `resetToken` and `resetTokenExpiry` to User model
- Create `/api/auth/forgot-password` endpoint
- Send email with reset link
- Create `/api/auth/reset-password/:token` endpoint

2. **2FA (Two-Factor Authentication):**
```bash
npm install speakeasy qrcode
```

3. **Rate Limiting:**
```bash
npm install express-rate-limit
```

4. **Input Sanitization:**
```bash
npm install express-validator
```

---

### 15. Integrations
**Status:** Spotify model exists, not implemented

**Priority Integrations:**

#### A. Google Drive Backup
```bash
npm install googleapis
```
- OAuth flow for Google Drive
- Auto-backup to Drive
- Restore from Drive

#### B. Dropbox Sync
```bash
npm install dropbox
```

#### C. Spotify Integration
```bash
npm install spotify-web-api-node
```
- OAuth flow
- Save currently playing track
- Link tracks to entries
- Mood-based playlist generation

---

## 📋 Quick Implementation Order

**Week 1: Foundation**
1. ✅ Export & Backup UI
2. Image Upload & Gallery
3. Database Performance (indexes)

**Week 2: Content**
4. Rich Text Editor
5. Advanced Search & Filters

**Week 3: Engagement**
6. Reminders & Notifications
7. Goals & Challenges

**Week 4: Advanced**
8. Advanced AI Features
9. Security (Password Reset, 2FA)

**Week 5: Integrations**
10. Google Drive backup
11. Spotify integration
12. Mobile improvements

---

## 🎨 UI Components to Create

1. `ExportDialog.jsx` - Export options modal
2. `RichTextEditor.jsx` - Tiptap editor wrapper
3. `ImageGallery.jsx` - Photo gallery view
4. `GoalsPanel.jsx` - Goals & challenges UI
5. `AdvancedSearch.jsx` - Enhanced search filters
6. `NotificationCenter.jsx` - In-app notifications

---

## 🔐 Environment Variables Needed

Add to `.env`:
```env
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Drive
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Spotify
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
```

---

## 📊 Database Migrations Needed

**For performance:**
```javascript
// Run in MongoDB shell or via migration script
db.entries.createIndex({ user: 1, createdAt: -1 });
db.entries.createIndex({ user: 1, mood: 1 });
db.entries.createIndex({ user: 1, tags: 1 });
db.entries.createIndex({ user: 1, isFavorite: 1, createdAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## 🧪 Testing Checklist

- [ ] Export works for all formats (JSON, MD, CSV)
- [ ] Backup includes all user data
- [ ] Image upload & compression works
- [ ] Rich text editor saves/loads correctly
- [ ] Notifications are sent on schedule
- [ ] Goals track progress accurately
- [ ] Search filters work correctly
- [ ] Mobile gestures feel natural
- [ ] All integrations authenticate properly

---

## 📱 PWA Enhancements

Update `client/public/sw.js` for:
- Offline image caching
- Background sync for entries
- Push notification handling

---

## 🚀 Deployment Considerations

1. **Database:** Currently using MongoDB locally - need cloud database
2. **File Storage:** Need Cloudinary or S3 for images
3. **Email Service:** Need SMTP credentials or SendGrid
4. **Environment:** Vercel/Netlify for frontend, Railway/Render for backend

---

## Next Steps

1. Add Export UI to Settings Panel
2. Set up Cloudinary for image uploads
3. Implement rich text editor
4. Add database indexes
5. Set up email service for reminders

Let me know which feature you want to tackle next!
