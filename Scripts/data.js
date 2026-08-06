// =====================================================
// DONNÉES DE L'APPLICATION
// =====================================================

let transactions = [];

// =====================================================
// CHARGER LES DONNÉES
// =====================================================
function loadData() {
    const saved = localStorage.getItem('transactions');
    if (saved) {
        try {
            transactions = JSON.parse(saved);
            console.log(`✅ ${transactions.length} transactions chargées`);
        } catch (e) {
            console.error('Erreur de chargement:', e);
            transactions = [];
        }
    } else {
        console.log('📭 Aucune donnée sauvegardée');
    }
}

// =====================================================
// SAUVEGARDER LES DONNÉES
// =====================================================
function saveData() {
    try {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        console.log('💾 Données sauvegardées');
    } catch (e) {
        console.error('Erreur de sauvegarde:', e);
    }
}

// =====================================================
// AJOUTER UNE TRANSACTION
// =====================================================
function addTransaction(data) {
    const transaction = {
        id: Date.now(),
        produit: data.produit.trim(),
        categorie: data.categorie.trim() || 'Non catégorisé',
        prix: parseFloat(data.prix),
        quantite: parseInt(data.quantite),
        type: data.type,
        client: data.client.trim() || 'Inconnu',
        date: new Date().toLocaleDateString('fr-FR'),
        timestamp: Date.now()
    };
    
    transactions.unshift(transaction);
    saveData();
    return transaction;
}

// =====================================================
// SUPPRIMER UNE TRANSACTION
// =====================================================
function deleteTransaction(id) {
    if (!confirm('Supprimer cette transaction ?')) return;
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    refreshUI();
    applyFilters();
}