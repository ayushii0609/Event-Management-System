const API = 'https://event-management-system-production-288f.up.railway.app/api';
let currentEventId = null;
let currentUser    = null;

async function init() {
    try {
        const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
        if (res.ok) {
            currentUser = await res.json();
            document.getElementById('user-greeting').textContent = `Hi, ${currentUser.name}`;
            document.getElementById('btn-logout').style.display = 'inline-block';
            document.getElementById('btn-login').style.display  = 'none';
            if (currentUser.role === 'admin') {
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
            }
        }
    } catch (e) {}
    loadEvents();
}

function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');
    if (name === 'events') loadEvents();
}

async function loadEvents() {
    const container = document.getElementById('events-list');
    container.innerHTML = `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading events...</p></div>`;

    try {
        const res    = await fetch(`${API}/events`, { credentials: 'include' });
        const events = await res.json();

        if (events.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fa-regular fa-calendar-xmark"></i><p>No events yet.</p></div>`;
            return;
        }

        const isAdmin = currentUser && currentUser.role === 'admin';

        container.innerHTML = events.map(ev => `
            <div class="event-card" id="card-${ev.id}">
                <span class="seats-badge"><i class="fa-solid fa-chair"></i> ${ev.max_seats} seats</span>
                <div class="event-tag"><i class="fa-solid fa-calendar"></i> &nbsp;${formatDate(ev.event_date)}</div>
                <h3>${ev.title}</h3>
                <p>${ev.description || 'No description provided.'}</p>
                <div class="event-meta">
                    <div class="meta-item"><i class="fa-solid fa-location-dot"></i> ${ev.location || 'TBA'}</div>
                    <div class="meta-item"><i class="fa-solid fa-clock"></i> ${formatTime(ev.event_time)}</div>
                    <div class="meta-item"><i class="fa-solid fa-user-tie"></i> ${ev.organizer || 'Unknown'}</div>
                </div>
                <div class="card-actions">
                    <button class="btn-register" onclick="openModal(${ev.id}, '${escapeHtml(ev.title)}')">
                        <i class="fa-solid fa-ticket"></i> Register / View
                    </button>
                    ${isAdmin ? `<button class="btn-delete" onclick="deleteEvent(${ev.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
            </div>
        `).join('');

    } catch (err) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not connect to server.</p></div>`;
    }
}

async function addEvent() {
    const title       = document.getElementById('inp-title').value.trim();
    const description = document.getElementById('inp-description').value.trim();
    const location    = document.getElementById('inp-location').value.trim();
    const event_date  = document.getElementById('inp-date').value;
    const event_time  = document.getElementById('inp-time').value;
    const organizer   = document.getElementById('inp-organizer').value.trim();
    const max_seats   = document.getElementById('inp-seats').value || 50;

    if (!title || !event_date) {
        showMsg('add-event-msg', 'Please fill in the Event Title and Date.', 'error');
        return;
    }

    const res  = await fetch(`${API}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, location, event_date, event_time, organizer, max_seats }),
        credentials: 'include'
    });
    const data = await res.json();

    if (res.ok) {
        showMsg('add-event-msg', data.message, 'success');
        clearForm();
    } else {
        showMsg('add-event-msg', data.error, 'error');
    }
}

async function deleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    const res = await fetch(`${API}/events/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) document.getElementById('card-' + id)?.remove();
}

function openModal(eventId, title) {
    currentEventId = eventId;
    document.getElementById('modal-event-title').textContent = title;
    document.getElementById('modal-overlay').classList.add('open');
    switchTab('register', null);
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    currentEventId = null;
}

function switchTab(tab, e) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-register').style.display  = tab === 'register'  ? 'block' : 'none';
    document.getElementById('tab-attendees').style.display = tab === 'attendees' ? 'block' : 'none';
    if (e) e.target.classList.add('active');
    else document.querySelector('.tab-btn').classList.add('active');
    if (tab === 'attendees') loadAttendees();
    if (tab === 'register')  renderRegisterTab();
}

function renderRegisterTab() {
    const container = document.getElementById('register-content');
    if (!currentUser) {
        container.innerHTML = `
            <div class="no-attendees" style="padding:24px 0;">
                <i class="fa-solid fa-lock" style="font-size:2rem;color:var(--accent);display:block;margin-bottom:10px;"></i>
                <p style="margin-bottom:16px;">Please login to register for this event</p>
                <button class="btn-primary" onclick="window.location.href='login.html'">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> Login
                </button>
            </div>`;
        return;
    }
    container.innerHTML = `
        <div class="form-group" style="margin-top:4px;">
            <label>Phone Number (optional)</label>
            <input type="tel" id="reg-phone" placeholder="10-digit phone number"/>
        </div>
        <button class="btn-primary" onclick="registerForEvent()">
            <i class="fa-solid fa-check"></i> Confirm Registration
        </button>
        <div id="reg-msg" class="msg-box" style="display:none;"></div>`;
}

async function registerForEvent() {
    const phone = document.getElementById('reg-phone')?.value.trim();

    const res  = await fetch(`${API}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: currentEventId, phone }),
        credentials: 'include'
    });
    const data = await res.json();

    if (res.ok) {
        showMsg('reg-msg', '🎉 ' + data.message, 'success');
    } else {
        showMsg('reg-msg', data.error, 'error');
    }
}

async function loadAttendees() {
    const container = document.getElementById('attendees-list');
    container.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;">Loading...</p>';

    const res       = await fetch(`${API}/registrations/${currentEventId}`, { credentials: 'include' });
    const attendees = await res.json();

    if (attendees.length === 0) {
        container.innerHTML = '<p class="no-attendees">No one has registered yet.</p>';
        return;
    }

    const isAdmin = currentUser && currentUser.role === 'admin';

    container.innerHTML = attendees.map(a => `
        <div class="attendee-item" id="att-${a.id}">
            <div class="attendee-avatar">${a.name.charAt(0).toUpperCase()}</div>
            <div class="attendee-info">
                <strong>${a.name}</strong>
                <span>${a.email} ${a.phone ? '· ' + a.phone : ''}</span>
            </div>
            ${isAdmin ? `<button class="btn-cancel-reg" onclick="cancelRegistration(${a.id})">Remove</button>` : ''}
        </div>
    `).join('');
}

async function cancelRegistration(regId) {
    if (!confirm('Remove this registration?')) return;
    const res = await fetch(`${API}/registrations/${regId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) document.getElementById('att-' + regId)?.remove();
}

async function handleLogout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.reload();
}

function showMsg(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent   = text;
    el.className     = 'msg-box ' + type;
    el.style.display = 'block';
}

function formatDate(dateStr) {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) return 'Time TBA';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function escapeHtml(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function clearForm() {
    ['inp-title','inp-description','inp-location','inp-date','inp-time','inp-organizer','inp-seats']
        .forEach(id => document.getElementById(id).value = '');
}

init();
