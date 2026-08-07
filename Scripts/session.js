// =====================================================
// GESTION DE LA SESSION ET DES DROITS
// =====================================================

function getCurrentUser() {
    const user = sessionStorage.getItem('user');
    if (!user) return null;
    try { return JSON.parse(user); } catch (e) { return null; }
}

function isLoggedIn() { return getCurrentUser() !== null; }
function isAdmin() { const user = getCurrentUser(); return user && user.role === 'admin'; }
function isEmployee() { const user = getCurrentUser(); return user && user.role === 'employee'; }

function requireLogin() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
    return true;
}

function requireAdmin() {
    if (!isAdmin()) { alert('⛔ Accès refusé. Seul l\'administrateur peut effectuer cette action.'); return false; }
    return true;
}

function addLogoutButton() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const oldBtn = nav.querySelector('.logout-btn');
    if (oldBtn) oldBtn.remove();
    const logoutLink = document.createElement('a');
    logoutLink.className = 'logout-btn';
    logoutLink.href = '#';
    logoutLink.onclick = function(e) {
        e.preventDefault();
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    };
    logoutLink.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i> Déconnexion';
    logoutLink.style.background = '#e74c3c';
    logoutLink.style.color = '#ffffff';
    nav.appendChild(logoutLink);
}

function addRoleBadge() {
    const user = getCurrentUser();
    if (!user) return;
    const header = document.querySelector('.logo-title-wrapper');
    if (!header) return;
    const oldBadge = document.querySelector('.role-badge');
    if (oldBadge) oldBadge.remove();
    const badge = document.createElement('span');
    badge.className = `role-badge ${user.role === 'admin' ? 'admin' : 'employee'}`;
    badge.textContent = user.role === 'admin' ? '🔑 Administrateur' : '👤 Employé';
    badge.style.cssText = `display:inline-block;padding:4px 14px;border-radius:20px;font-size:0.75rem;font-weight:600;margin-top:5px;background:${user.role === 'admin' ? '#d4edda' : '#fff3cd'};color:${user.role === 'admin' ? '#155724' : '#856404'};`;
    header.appendChild(badge);
}

function hideAddLinkForEmployee() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        document.querySelectorAll('nav a').forEach(link => { if (link.getAttribute('href') === 'add.html') link.style.display = 'none'; });
    }
}

function hideAdminElements() {
    if (!isAdmin()) document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
}

function initSession() {
    if (!requireLogin()) return;
    addLogoutButton();
    addRoleBadge();
    hideAdminElements();
    hideAddLinkForEmployee();
}

document.addEventListener('DOMContentLoaded', function() { initSession(); });