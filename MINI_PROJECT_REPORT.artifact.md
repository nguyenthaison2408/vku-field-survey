# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)
**Mini-Project Title:** Mini-Project 1: VKU Field Survey — Offline Data Collection
**Team / Student Name:** [Your Name / Team Name]
**Submission Date:** 10/09/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. [Your Full Name] — Student ID: [22ITxxx] — Role: Fullstack Developer — Contribution: 100%
* **🔗 Live Demo URL:** [https://[your-username].github.io/vku-field-survey/](https://[your-username].github.io/vku-field-survey/) (Or your APK download link)
* **💻 GitHub Repository:** [https://github.com/[your-username]/vku-field-survey](https://github.com/[your-username]/vku-field-survey)
* **🎥 Video Demo (Optional):** [Link to Screen Recording]

---

## 2. FEATURE IMPLEMENTATION CHECKLIST
| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | PWA Standalone Installation | ✅ Complete | Manifest.json configured for standalone mode, #0284c7 theme, and Service Worker caching for offline boot. |
| 2 | Offline Local Persistence | ✅ Complete | Uses `localforage` (IndexedDB) to save survey drafts instantly, preventing data loss during offline usage. |
| 3 | Automatic Background Sync | ✅ Complete | Implemented a sync queue logic that detects `window.ononline` and automatically flushes pending surveys to Google Sheets. |
| 4 | Capacitor Native Integration | ✅ Complete | Integrated `@capacitor/camera` for native photo capture and `@capacitor/network` for real-time status monitoring. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE
* **Structure:**
    * `/www`: Contains the core PWA (HTML, CSS, Vanilla JS).
    * `/android`: Capacitor-generated native Android project.
    * `sw.js`: Service Worker for Cache-First asset management.
    * `app.js`: State management using a "Pending Queue" pattern stored in IndexedDB.
* **Flow:** Data is captured -> Saved to `localforage` (Status: PENDING) -> Network listener triggers `fetch()` to Google Apps Script -> Status updated to SYNCED.
* **Error Handling:** Uses `try-catch` blocks during sync and `no-cors` mode for Google Script compatibility.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS
*(Note: Please replace these with actual screenshots from your emulator)*
1. **[Screenshot 1: Form Interface]** - The responsive Material-style survey form.
2. **[Screenshot 2: Offline Mode]** - Badge showing "1 Pending" when Wi-Fi is disabled.
3. **[Screenshot 3: Google Sheets]** - Data automatically appearing in the spreadsheet after reconnection.

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS
* **Challenge 1: CORS issues with Google Apps Script.**
    * *Resolution:* Used `mode: 'no-cors'` in the `fetch` API and returned `ContentService` from the Google Script to ensure data is received even without a direct header match.
* **Challenge 2: Native Camera vs. Browser Fallback.**
    * *Resolution:* Implemented a detection logic in `app.js` to check for `window.Capacitor`. If present, it triggers the native camera; otherwise, it falls back to a standard `<input type="file">`.
