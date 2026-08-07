// =====================================================
// APPLICATION PRINCIPALE - VERSION FCFA
// =====================================================

const themeBtn = document.getElementById('theme-btn');

// =====================================================
// VÉRIFICATION DES DROITS
// =====================================================
function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem('user')); } catch (e) { return null; }
}
function isAdmin() { const user = getCurrentUser(); return user && user.role === 'admin'; }
function isEmployee() { const user = getCurrentUser(); return user && user.role === 'employee'; }

// =====================================================
// CALCULER LES STATISTIQUES
// =====================================================
function getStats() {
    let stock = 0, entrees = 0, sorties = 0;
    transactions.forEach(t => {
        const total = t.prix * t.quantite;
        if (t.type === 'entree') { stock += t.quantite; entrees += total; }
        else { stock -= t.quantite; sorties += total; }
    });
    return { stock: stock, entrees: entrees, sorties: sorties, benefice: sorties - entrees };
}

function formatNumber(value) { return value.toLocaleString('fr-FR'); }

// =====================================================
// AFFICHER UNE TRANSACTION
// =====================================================
function renderTransaction(t) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.style.borderLeftColor = t.type === 'entree' ? '#2ecc71' : '#e74c3c';
    const isEntree = t.type === 'entree';
    const badgeClass = isEntree ? 'badge-entree' : 'badge-sortie';
    const badgeText = isEntree ? '📥 Entrée' : '📤 Sortie';
    const productName = t.produit.length > 30 ? t.produit.substring(0, 27) + '...' : t.produit;
    const formattedPrice = formatNumber(t.prix);
    const isAdminUser = isAdmin();
    div.innerHTML = `
        <div class="info">
            <span class="name" title="${t.produit}">${productName}</span>
            <span class="category">${t.categorie}</span>
            <span class="price">${formattedPrice} FCFA</span>
            <span class="qty">×${t.quantite}</span>
            <span class="badge ${badgeClass}">${badgeText}</span>
            <span class="date">${t.date}</span>
            <span class="client-name" title="${t.client}">${t.client}</span>
        </div>
        <div class="actions">
            ${isAdminUser ? `<button class="delete-btn" onclick="deleteTransaction(${t.id})" title="Supprimer"><i class="fa-solid fa-trash-can"></i></button>` : ''}
        </div>
    `;
    return div;
}

function renderTransactionList(container, list) {
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-secondary);opacity:0.6;"><i class="fa-solid fa-inbox" style="font-size:3rem;display:block;margin-bottom:15px;"></i><p>Aucune transaction pour le moment</p><p style="font-size:0.9rem;margin-top:5px;">Ajoutez-en une depuis la page "Ajouter"</p></div>`;
        return;
    }
    list.forEach(t => container.appendChild(renderTransaction(t)));
}

// =====================================================
// RAFRAÎCHIR L'INTERFACE
// =====================================================
function refreshUI() {
    const stats = getStats();
    const stockEl = document.getElementById('stock-total');
    const entreesEl = document.getElementById('entrees-total');
    const sortiesEl = document.getElementById('sorties-total');
    const beneficeEl = document.getElementById('benefice-total');
    if (stockEl) stockEl.textContent = stats.stock;
    if (entreesEl) entreesEl.textContent = formatNumber(stats.entrees) + ' FCFA';
    if (sortiesEl) sortiesEl.textContent = formatNumber(stats.sorties) + ' FCFA';
    if (beneficeEl) {
        beneficeEl.textContent = formatNumber(stats.benefice) + ' FCFA';
        beneficeEl.style.color = stats.benefice >= 0 ? '#2ecc71' : '#e74c3c';
    }
    const recentList = document.getElementById('recent-list');
    if (recentList) renderTransactionList(recentList, transactions.slice(0, 5));
}

// =====================================================
// FILTRES ET RECHERCHE
// =====================================================
function applyFilters() {
    const search = document.getElementById('search-input')?.value.toLowerCase() || '';
    const filterType = document.getElementById('filter-type')?.value || 'all';
    let filtered = transactions;
    if (search) filtered = filtered.filter(t => t.produit.toLowerCase().includes(search) || t.categorie.toLowerCase().includes(search) || t.client.toLowerCase().includes(search));
    if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
    const container = document.getElementById('transaction-list');
    if (container) renderTransactionList(container, filtered);
}

// =====================================================
// STATISTIQUES DÉTAILLÉES
// =====================================================
function updateStatsDetail() {
    const productCount = {};
    transactions.forEach(t => { if (t.type === 'sortie') productCount[t.produit] = (productCount[t.produit] || 0) + t.quantite; });
    const sorted = Object.entries(productCount).sort((a, b) => b[1] - a[1]);
    const topList = document.getElementById('top-products');
    if (topList) {
        topList.innerHTML = '';
        if (sorted.length === 0) topList.innerHTML = '<li>Aucune vente enregistrée</li>';
        else sorted.slice(0, 10).forEach(([name, qty]) => {
            const li = document.createElement('li');
            const displayName = name.length > 25 ? name.substring(0, 22) + '...' : name;
            li.innerHTML = `<span title="${name}">${displayName}</span><span>${qty} vendus</span>`;
            topList.appendChild(li);
        });
    }
    const monthly = {};
    transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        if (!monthly[month]) monthly[month] = { entrees: 0, sorties: 0 };
        const total = t.prix * t.quantite;
        if (t.type === 'entree') monthly[month].entrees += total;
        else monthly[month].sorties += total;
    });
    const summaryDiv = document.getElementById('monthly-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = '';
        const sortedMonths = Object.keys(monthly).sort();
        if (sortedMonths.length === 0) summaryDiv.innerHTML = '<p>Aucune donnée</p>';
        else sortedMonths.forEach(month => {
            const d = monthly[month];
            const p = document.createElement('p');
            p.innerHTML = `<strong>${month}</strong> : Entrées ${formatNumber(d.entrees)} FCFA | Sorties ${formatNumber(d.sorties)} FCFA | Bénéfice ${formatNumber(d.sorties - d.entrees)} FCFA`;
            summaryDiv.appendChild(p);
        });
    }
}

// =====================================================
// SUPPRIMER UNE TRANSACTION (AVEC VÉRIFICATION)
// =====================================================
function deleteTransaction(id) {
    const user = getCurrentUser();
    if (!user) { alert('⚠️ Veuillez vous connecter.'); window.location.href = 'login.html'; return; }
    if (user.role !== 'admin') { alert('⛔ Accès refusé. Seul l\'administrateur peut supprimer des transactions.'); return; }
    if (!confirm('Supprimer cette transaction ?')) return;
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    refreshUI();
    applyFilters();
}

// =====================================================
// MODE SOMBRE
// =====================================================
if (themeBtn) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') { document.body.classList.add('dark-mode'); themeBtn.textContent = '☀️'; }
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeBtn.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// =====================================================
// INITIALISATION
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    refreshUI();
});