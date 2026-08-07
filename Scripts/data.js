// =====================================================
// DONNÉES DE L'APPLICATION
// =====================================================
let transactions = [];

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

function saveData() {
    try {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        console.log('💾 Données sauvegardées');
    } catch (e) {
        console.error('Erreur de sauvegarde:', e);
    }
}

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

function getProductStock(produit) {
    let stock = 0;
    transactions.forEach(t => {
        if (t.produit === produit) {
            if (t.type === 'entree') stock += t.quantite;
            else stock -= t.quantite;
        }
    });
    return stock;
}

function canSellProduct(produit, quantite) {
    const stockDisponible = getProductStock(produit);
    if (stockDisponible < quantite) {
        return { possible: false, stockDisponible: stockDisponible, message: `⚠️ Stock insuffisant ! Vous avez ${stockDisponible} unités disponibles.` };
    }
    return { possible: true, stockDisponible: stockDisponible, message: `✅ Stock suffisant : ${stockDisponible} unités disponibles.` };
}