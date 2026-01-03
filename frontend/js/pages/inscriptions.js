let currentInscription = null;
let isEditing = false;

document.addEventListener('DOMContentLoaded', function() {
    const addInscriptionBtn = document.getElementById('add-inscription-btn');
    const inscriptionFormElement = document.getElementById('inscription-form-element');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');
    
    if (addInscriptionBtn) {
        addInscriptionBtn.addEventListener('click', handleAddClick);
    }
    
    if (inscriptionFormElement) {
        inscriptionFormElement.addEventListener('submit', handleInscriptionSubmit);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideInscriptionForm);
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteClick);
    }
    
    // Charger les données
    loadInscriptions();
    loadApprenants();
    loadFormations();
});

async function loadInscriptions() {
    try {
        const inscriptions = await api.getInscriptions();
        displayInscriptions(inscriptions);
    } catch (error) {
        console.error('Error loading inscriptions:', error);
        showAlert('Erreur lors du chargement des inscriptions', 'error');
    }
}

async function loadApprenants() {
    try {
        const response = await api.getApprenants();
        console.log('Apprenants - Réponse brute:', response);
        console.log('Type de réponse:', typeof response);
        console.log('Est un tableau:', Array.isArray(response));
        
        // Gérer les différents formats de réponse
        let apprenants;
        
        if (Array.isArray(response)) {
            // Réponse directe sous forme de tableau
            apprenants = response;
        } else if (response && response.apprenants && Array.isArray(response.apprenants)) {
            // Réponse avec pagination
            apprenants = response.apprenants;
            console.log('Apprenants extraits de response.apprenants');
        } else if (response && response.data && Array.isArray(response.data)) {
            // Autre format possible
            apprenants = response.data;
        } else {
            console.error('Format de réponse non reconnu:', response);
            showAlert('Erreur: format de données incorrect pour les apprenants', 'error');
            return;
        }
        
        console.log('Apprenants finaux:', apprenants);
        console.log('Nombre d\'apprenants:', apprenants.length);
        
        if (!Array.isArray(apprenants)) {
            console.error('ERREUR: apprenants n\'est toujours pas un tableau!');
            return;
        }
        
        populateApprenantSelect(apprenants);
    } catch (error) {
        console.error('Error loading apprenants:', error);
        showAlert('Erreur lors du chargement des apprenants', 'error');
    }
}

async function loadFormations() {
    try {
        const response = await api.getFormations();
        console.log('Formations - Réponse brute:', response);
        
        // Gérer les différents formats de réponse
        let formations;
        
        if (Array.isArray(response)) {
            formations = response;
        } else if (response && response.formations && Array.isArray(response.formations)) {
            formations = response.formations;
        } else if (response && response.data && Array.isArray(response.data)) {
            formations = response.data;
        } else {
            console.error('Format de réponse non reconnu:', response);
            // Si ce n'est pas un tableau et qu'il n'y a pas de propriétés connues,
            // essayer de le traiter comme un tableau directement
            formations = [];
        }
        
        console.log('Formations finales:', formations);
        console.log('Nombre de formations:', formations.length);
        
        if (!Array.isArray(formations)) {
            console.error('ERREUR: formations n\'est pas un tableau!');
            return;
        }
        
        populateFormationSelect(formations);
    } catch (error) {
        console.error('Error loading formations:', error);
        showAlert('Erreur lors du chargement des formations', 'error');
    }
}

function displayInscriptions(inscriptions) {
    const container = document.getElementById('inscriptions-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (inscriptions.length === 0) {
        container.innerHTML = '<p class="no-data">Aucune inscription trouvée</p>';
        return;
    }

    inscriptions.forEach(inscription => {
        const inscriptionDiv = document.createElement('div');
        inscriptionDiv.className = 'inscription-item';
        
        const dateInscription = new Date(inscription.dateInscription).toLocaleDateString('fr-FR');
        const apprenantNom = inscription.apprenantId ? 
            `${inscription.apprenantId.nom} ${inscription.apprenantId.prenom}` : 
            'Apprenant inconnu';
        const formationTitre = inscription.formationId ? 
            inscription.formationId.titre : 
            'Formation inconnue';
        
        // Couleur du statut
        let statutClass = '';
        switch(inscription.statut) {
            case 'Inscrit':
                statutClass = 'statut-inscrit';
                break;
            case 'Terminé':
                statutClass = 'statut-termine';
                break;
            case 'Annulé':
                statutClass = 'statut-annule';
                break;
        }
        
        // Couleur du paiement
        const paiementClass = inscription.paiement === 'Payé' ? 'paiement-paye' : 'paiement-non-paye';
        
        inscriptionDiv.innerHTML = `
            <div class="inscription-header">
                <h3>${apprenantNom}</h3>
                <span class="inscription-statut ${statutClass}">${inscription.statut}</span>
            </div>
            <p><strong>Formation:</strong> ${formationTitre}</p>
            <p><strong>Date d'inscription:</strong> ${dateInscription}</p>
            <p><strong>Paiement:</strong> <span class="${paiementClass}">${inscription.paiement}</span></p>
            <div class="inscription-actions">
                <button class="btn-edit" onclick="editInscription('${inscription._id}')">Modifier</button>
                <button class="btn-delete" onclick="deleteInscription('${inscription._id}')">Supprimer</button>
            </div>
        `;
        container.appendChild(inscriptionDiv);
    });
}

function populateApprenantSelect(apprenants) {
    const select = document.getElementById('apprenantId');
    if (!select) {
        console.error('Élément apprenantId non trouvé');
        return;
    }
    
    select.innerHTML = '<option value="">Sélectionnez un apprenant</option>';
    
    if (!apprenants || apprenants.length === 0) {
        select.innerHTML = '<option value="">Aucun apprenant disponible</option>';
        console.warn('Aucun apprenant à afficher');
        return;
    }
    
    apprenants.forEach(apprenant => {
        const option = document.createElement('option');
        option.value = apprenant._id;
        option.textContent = `${apprenant.nom} ${apprenant.prenom} - ${apprenant.email}`;
        select.appendChild(option);
    });
    
    console.log(`${apprenants.length} apprenants chargés`);
}

function populateFormationSelect(formations) {
    const select = document.getElementById('formationId');
    if (!select) {
        console.error('Élément formationId non trouvé');
        return;
    }
    
    select.innerHTML = '<option value="">Sélectionnez une formation</option>';
    
    if (!formations || formations.length === 0) {
        select.innerHTML = '<option value="">Aucune formation disponible</option>';
        console.warn('Aucune formation à afficher');
        return;
    }
    
    formations.forEach(formation => {
        const option = document.createElement('option');
        option.value = formation._id;
        
        const dateDebut = new Date(formation.dateDebut).toLocaleDateString('fr-FR');
        option.textContent = `${formation.titre} (${dateDebut}) - ${formation.niveau}`;
        select.appendChild(option);
    });
    
    console.log(`${formations.length} formations chargées`);
}

function handleAddClick() {
    currentInscription = null;
    isEditing = false;
    showInscriptionForm();
}

function showInscriptionForm() {
    const inscriptionsList = document.getElementById('inscriptions-list');
    if (inscriptionsList) {
        inscriptionsList.style.display = 'none';
    }
    
    const formSection = document.getElementById('inscription-form');
    if (formSection) {
        formSection.style.display = 'block';
    }
    
    const title = document.getElementById('form-title');
    if (title) {
        title.textContent = isEditing ? 'Modifier l\'Inscription' : 'Ajouter une Inscription';
    }
    
    // Gérer les champs en fonction du mode
    const apprenantSelect = document.getElementById('apprenantId');
    const formationSelect = document.getElementById('formationId');
    
    if (isEditing) {
        // En mode édition, désactiver la sélection apprenant/formation
        if (apprenantSelect) apprenantSelect.disabled = true;
        if (formationSelect) formationSelect.disabled = true;
    } else {
        // En mode ajout, activer tous les champs
        if (apprenantSelect) apprenantSelect.disabled = false;
        if (formationSelect) formationSelect.disabled = false;
        resetInscriptionForm();
    }
}

function resetInscriptionForm() {
    const form = document.getElementById('inscription-form-element');
    if (form) {
        form.reset();
    }
    
    const inscriptionIdInput = document.getElementById('inscription-id');
    if (inscriptionIdInput) {
        inscriptionIdInput.value = '';
    }
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
    
    currentInscription = null;
    isEditing = false;
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Ajouter une Inscription';
    }
}

function hideInscriptionForm() {
    const inscriptionsList = document.getElementById('inscriptions-list');
    if (inscriptionsList) {
        inscriptionsList.style.display = 'block';
    }
    
    const formSection = document.getElementById('inscription-form');
    if (formSection) {
        formSection.style.display = 'none';
    }
    
    resetInscriptionForm();
}

function populateInscriptionForm(inscription) {
    currentInscription = inscription;
    isEditing = true;
    
    const inscriptionIdInput = document.getElementById('inscription-id');
    if (inscriptionIdInput) {
        inscriptionIdInput.value = inscription._id;
    }
    
    // Remplir les sélecteurs
    const apprenantSelect = document.getElementById('apprenantId');
    const formationSelect = document.getElementById('formationId');
    const statutSelect = document.getElementById('statut');
    const paiementSelect = document.getElementById('paiement');
    
    if (apprenantSelect && inscription.apprenantId) {
        apprenantSelect.value = inscription.apprenantId._id;
    }
    
    if (formationSelect && inscription.formationId) {
        formationSelect.value = inscription.formationId._id;
    }
    
    if (statutSelect) {
        statutSelect.value = inscription.statut || 'Inscrit';
    }
    
    if (paiementSelect) {
        paiementSelect.value = inscription.paiement || 'Non payé';
    }
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.style.display = 'inline-block';
    }
    
    showInscriptionForm();
}

async function handleInscriptionSubmit(event) {
    event.preventDefault();
    
    console.log('=== SOUMISSION INSCRIPTION ===');
    console.log('Mode édition:', isEditing);
    
    const inscriptionData = {
        apprenantId: document.getElementById('apprenantId').value,
        formationId: document.getElementById('formationId').value,
        statut: document.getElementById('statut')?.value || 'Inscrit',
        paiement: document.getElementById('paiement')?.value || 'Non payé'
    };
    
    console.log('Données:', inscriptionData);
    
    try {
        let result;
        
        if (isEditing && currentInscription) {
            // MODE MISE À JOUR - seulement statut et paiement
            console.log('Mise à jour inscription:', currentInscription._id);
            const updateData = {
                statut: inscriptionData.statut,
                paiement: inscriptionData.paiement
            };
            result = await api.updateInscription(currentInscription._id, updateData);
            showAlert('Inscription modifiée avec succès', 'success');
        } else {
            // MODE CRÉATION
            console.log('Création nouvelle inscription');
            result = await api.createInscription(inscriptionData);
            showAlert('Inscription créée avec succès', 'success');
        }
        
        console.log('Résultat:', result);
        hideInscriptionForm();
        loadInscriptions();
        
    } catch (error) {
        console.error('Erreur:', error);
        const message = error.data?.message || error.message || 'Une erreur est survenue';
        showAlert(message, 'error');
    }
}

async function editInscription(id) {
    try {
        const inscription = await api.getInscription(id);
        populateInscriptionForm(inscription);
    } catch (error) {
        console.error('Error loading inscription:', error);
        showAlert('Erreur lors du chargement de l\'inscription', 'error');
    }
}

async function deleteInscription(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action est irréversible.')) {
        try {
            await api.deleteInscription(id);
            showAlert('Inscription supprimée avec succès', 'success');
            loadInscriptions();
            
            const inscriptionIdInput = document.getElementById('inscription-id');
            if (isEditing && inscriptionIdInput && inscriptionIdInput.value === id) {
                hideInscriptionForm();
            }
        } catch (error) {
            console.error('Error deleting inscription:', error);
            showAlert('Erreur lors de la suppression de l\'inscription', 'error');
        }
    }
}

async function handleDeleteClick() {
    const inscriptionIdInput = document.getElementById('inscription-id');
    const inscriptionId = inscriptionIdInput ? inscriptionIdInput.value : '';
    if (!inscriptionId) return;
    
    deleteInscription(inscriptionId);
}

// Exposer les fonctions globales
window.editInscription = editInscription;
window.deleteInscription = deleteInscription;