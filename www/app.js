// Configuration
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLU-4k_5KbjgAaN0UEJxrL1a6HdE-XkJUSHEvYv5PVu4RjgPhHdljr9eCuUHx32KuoRg/exec'; // Replace after deployment

// Initialize storage
const surveyStore = localforage.createInstance({
    name: "vku_surveys"
});

// UI Elements
const form = document.getElementById('survey-form');
const statusDiv = document.getElementById('connection-status');
const syncBadge = document.getElementById('sync-count');
const photoPreview = document.getElementById('photo-preview');
const photoDataInput = document.getElementById('photo-data');
const stars = document.querySelectorAll('.rating .star');
const ratingInput = document.getElementById('rating');

// State
let isOnline = navigator.onLine;

// 1. Connection Monitoring
function updateOnlineStatus() {
    isOnline = navigator.onLine;
    statusDiv.textContent = isOnline ? 'Online - Ready to Sync' : 'Offline - Saving to Drafts';
    statusDiv.className = `status-bar ${isOnline ? 'online' : 'offline'}`;
    if (isOnline) syncPendingSurveys();
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// 2. Rating Logic
stars.forEach(star => {
    star.addEventListener('click', () => {
        const val = star.getAttribute('data-value');
        ratingInput.value = val;
        stars.forEach(s => {
            s.classList.toggle('active', s.getAttribute('data-value') <= val);
        });
    });
});

// 3. Camera Logic (Capacitor vs Browser)
document.getElementById('take-photo').addEventListener('click', async () => {
    if (window.Capacitor && window.Capacitor.Plugins.Camera) {
        // Use Native Capacitor Camera
        try {
            const { Camera } = Capacitor.Plugins;
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: 'dataUrl'
            });
            photoPreview.src = image.dataUrl;
            photoPreview.style.display = 'block';
            photoDataInput.value = image.dataUrl;
        } catch (e) {
            console.error('Camera failed', e);
        }
    } else {
        // Fallback for PWA in browser
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (re) => {
                photoPreview.src = re.target.result;
                photoPreview.style.display = 'block';
                photoDataInput.value = re.target.result;
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }
});

// 4. Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const survey = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        building: document.getElementById('building').value,
        floor: document.getElementById('floor').value,
        room: document.getElementById('room').value,
        category: document.getElementById('category').value,
        rating: ratingInput.value,
        notes: document.getElementById('notes').value,
        photo: photoDataInput.value,
        status: 'PENDING_SYNC'
    };

    // Save to IndexedDB
    await surveyStore.setItem(survey.id, survey);

    // Reset Form
    form.reset();
    photoPreview.style.display = 'none';
    stars.forEach(s => s.classList.remove('active'));

    alert('Survey saved locally!');

    updateSyncCount();
    if (isOnline) syncPendingSurveys();
});

// 5. Sync Logic
async function updateSyncCount() {
    const keys = await surveyStore.keys();
    let pending = 0;
    for (const key of keys) {
        const item = await surveyStore.getItem(key);
        if (item.status === 'PENDING_SYNC') pending++;
    }
    syncBadge.style.display = pending > 0 ? 'inline' : 'none';
    syncBadge.textContent = `${pending} Pending`;
}

async function syncPendingSurveys() {
    if (!isOnline || SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL') return;

    const keys = await surveyStore.keys();
    for (const key of keys) {
        const survey = await surveyStore.getItem(key);
        if (survey.status === 'PENDING_SYNC') {
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Needed for Google Apps Script web apps
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(survey)
                });

                // Since mode is no-cors, we can't check response.ok,
                // we assume success if no error is thrown
                survey.status = 'SYNCED';
                await surveyStore.setItem(key, survey);
                console.log(`Synced: ${key}`);
            } catch (error) {
                console.error('Sync failed', error);
                break; // Stop syncing if error occurs
            }
        }
    }
    updateSyncCount();
}

updateSyncCount();