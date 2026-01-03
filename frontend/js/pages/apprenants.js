let currentApprenant = null;
let isEditing = false;

document.addEventListener('DOMContentLoaded', function() {
    const addApprenantBtn = document.getElementById('add-apprenant-btn');
    const apprenantFormElement = document.getElementById('apprenant-form-element');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (addApprenantBtn) {
        addApprenantBtn.addEventListener('click', handleAddClick);
    }
    
    if (apprenantFormElement) {
        apprenantFormElement.addEventListener('submit', handleApprenantSubmit);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideApprenantForm);
    }
    
    loadApprenants();
});

async function loadApprenants() {
    try {
        console.log('Chargement des apprenants...');
        const response = await api.getApprenants();
        console.log('Réponse API:', response);
        
        // Gérer les différents formats de réponse possibles
        let apprenants;
        
        if (Array.isArray(response)) {
            // Réponse directe sous forme de tableau
            apprenants = response;
        } else if (response && response.apprenants) {
            // Réponse avec pagination
            apprenants = response.apprenants;
        } else if (response && response.data) {
            // Autre format possible
            apprenants = response.data;
        } else {
            console.error('Format de réponse inattendu:', response);
            apprenants = [];
        }
        
        console.log('Apprenants extraits:', apprenants);
        displayApprenants(apprenants);
        
    } catch (error) {
        console.error('Error loading apprenants:', error);
        showAlert('Erreur lors du chargement des apprenants', 'error');
    }
}

function displayApprenants(apprenants) {
    const container = document.getElementById('apprenants-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (!apprenants || apprenants.length === 0) {
        container.innerHTML = '<p class="no-data">Aucun apprenant trouvé</p>';
        return;
    }

    apprenants.forEach(apprenant => {
        const apprenantDiv = document.createElement('div');
        apprenantDiv.className = 'apprenant-item';
        
        const dateNaissance = apprenant.dateNaissance ? 
            new Date(apprenant.dateNaissance).toLocaleDateString('fr-FR') : 
            'Non spécifié';
        
        const photoUrl = apprenant.photo ? 
            `http://localhost:5000/uploads/${apprenant.photo}` : 
            null;
        
        apprenantDiv.innerHTML = `
            <div class="apprenant-header">
                <h3>${apprenant.nom} ${apprenant.prenom}</h3>
                <span class="apprenant-statut ${apprenant.statut === 'Actif' ? 'statut-actif' : 'statut-inactif'}">
                    ${apprenant.statut || 'Actif'}
                </span>
            </div>
            <p><strong>Email:</strong> ${apprenant.email}</p>
            <p><strong>Date de naissance:</strong> ${dateNaissance}</p>
            <p><strong>Âge:</strong> ${apprenant.age} ans</p>
            ${apprenant.telephone ? `<p><strong>Téléphone:</strong> ${apprenant.telephone}</p>` : ''}
            ${apprenant.niveauEtude ? `<p><strong>Niveau d'étude:</strong> ${apprenant.niveauEtude}</p>` : ''}
            ${apprenant.profession ? `<p><strong>Profession:</strong> ${apprenant.profession}</p>` : ''}
            ${photoUrl ? `
                <div class="apprenant-photo">
                    <img src="${photoUrl}" alt="${apprenant.nom} ${apprenant.prenom}" 
                         class="apprenant-thumbnail">
                </div>
            ` : ''}
            ${apprenant.formationsInscrites && apprenant.formationsInscrites.length > 0 ? `
                <p><strong>Formations inscrites:</strong> ${apprenant.formationsInscrites.length}</p>
            ` : ''}
            <div class="apprenant-actions">
                <button class="btn-edit" onclick="editApprenant('${apprenant._id}')">Modifier</button>
                <button class="btn-delete" onclick="deleteApprenant('${apprenant._id}')">Supprimer</button>
            </div>
        `;
        container.appendChild(apprenantDiv);
    });
}

function handleAddClick() {
    currentApprenant = null;
    isEditing = false;
    showApprenantForm();
}

function showApprenantForm() {
    const apprenantsList = document.getElementById('apprenants-list');
    if (apprenantsList) {
        apprenantsList.style.display = 'none';
    }
    
    const formSection = document.getElementById('apprenant-form');
    if (formSection) {
        formSection.style.display = 'block';
    }
    
    const title = document.getElementById('form-title');
    if (title) {
        title.textContent = isEditing ? 'Modifier l\'Apprenant' : 'Ajouter un Apprenant';
    }
    
    // Gérer le message d'aide pour la photo
    const photoInput = document.getElementById('photo');
    const photoEditHelp = document.getElementById('photo-edit-help');
    
    if (isEditing) {
        if (photoInput) photoInput.required = false;
        if (photoEditHelp) photoEditHelp.style.display = 'block';
    } else {
        if (photoInput) photoInput.required = true;
        if (photoEditHelp) photoEditHelp.style.display = 'none';
    }
    
    if (!isEditing) {
        resetApprenantForm();
    }
}

function resetApprenantForm() {
    const form = document.getElementById('apprenant-form-element');
    if (form) {
        form.reset();
    }
    
    const apprenantIdInput = document.getElementById('apprenant-id');
    if (apprenantIdInput) {
        apprenantIdInput.value = '';
    }
    
    currentApprenant = null;
    isEditing = false;
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Ajouter un Apprenant';
    }
}

function hideApprenantForm() {
    const apprenantsList = document.getElementById('apprenants-list');
    if (apprenantsList) {
        apprenantsList.style.display = 'block';
    }
    
    const formSection = document.getElementById('apprenant-form');
    if (formSection) {
        formSection.style.display = 'none';
    }
    
    resetApprenantForm();
}

function populateApprenantForm(apprenant) {
    currentApprenant = apprenant;
    isEditing = true;
    
    const apprenantIdInput = document.getElementById('apprenant-id');
    if (apprenantIdInput) {
        apprenantIdInput.value = apprenant._id;
    }
    
    document.getElementById('nom').value = apprenant.nom || '';
    document.getElementById('prenom').value = apprenant.prenom || '';
    
    if (apprenant.dateNaissance) {
        const date = new Date(apprenant.dateNaissance);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('dateNaissance').value = formattedDate;
    }
    
    document.getElementById('age').value = apprenant.age || '';
    document.getElementById('email').value = apprenant.email || '';
    document.getElementById('telephone').value = apprenant.telephone || '';
    document.getElementById('niveauEtude').value = apprenant.niveauEtude || '';
    document.getElementById('profession').value = apprenant.profession || '';
    
    showApprenantForm();
}

async function handleApprenantSubmit(event) {
    event.preventDefault();
    
    console.log('=== SOUMISSION APPRENANT ===');
    console.log('Mode édition:', isEditing);
    
    // Récupérer toutes les valeurs des champs
    const nom = document.getElementById('nom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const dateNaissance = document.getElementById('dateNaissance').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value.trim();
    const telephone = document.getElementById('telephone')?.value.trim() || '';
    const niveauEtude = document.getElementById('niveauEtude')?.value || '';
    const profession = document.getElementById('profession')?.value.trim() || '';
    const photoFile = document.getElementById('photo')?.files[0];
    
    // Validation côté client
    if (!nom || !prenom || !dateNaissance || !age || !email) {
        showAlert('Veuillez remplir tous les champs obligatoires (nom, prénom, date de naissance, âge, email)', 'error');
        return;
    }
    
    // Validation de l'email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        showAlert('Veuillez entrer un email valide', 'error');
        return;
    }
    
    // Validation de l'âge
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
        showAlert('L\'âge doit être entre 16 et 100 ans', 'error');
        return;
    }
    
    // Vérifier la photo en mode création
    if (!isEditing && !photoFile) {
        showAlert('La photo est obligatoire pour créer un apprenant', 'error');
        return;
    }
    
    // Créer le FormData
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('prenom', prenom);
    formData.append('dateNaissance', dateNaissance);
    formData.append('age', ageNum);
    formData.append('email', email);
    formData.append('statut', 'Actif');
    
    if (telephone) formData.append('telephone', telephone);
    if (niveauEtude) formData.append('niveauEtude', niveauEtude);
    if (profession) formData.append('profession', profession);
    
    if (photoFile) {
        formData.append('photo', photoFile);
        console.log('Photo ajoutée:', photoFile.name);
    }
    
    // Log pour debug
    console.log('Données envoyées:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
    }
    
    try {
        let result;
        
        if (isEditing && currentApprenant) {
            // MODE MISE À JOUR
            console.log('Mise à jour apprenant:', currentApprenant._id);
            result = await api.updateApprenant(currentApprenant._id, formData);
            showAlert('Apprenant modifié avec succès', 'success');
        } else {
            // MODE CRÉATION
            console.log('Création nouvel apprenant');
            result = await api.createApprenant(formData);
            showAlert('Apprenant créé avec succès', 'success');
        }
        
        console.log('Résultat:', result);
        hideApprenantForm();
        loadApprenants();
        
    } catch (error) {
        console.error('Erreur complète:', error);
        
        // Afficher les erreurs de validation détaillées
        if (error.data?.errors && Array.isArray(error.data.errors)) {
            const errorMessages = error.data.errors.join('\n');
            showAlert(`Erreurs de validation:\n${errorMessages}`, 'error');
        } else {
            const message = error.data?.message || error.message || 'Une erreur est survenue';
            showAlert(message, 'error');
        }
    }
}

async function editApprenant(id) {
    try {
        const apprenant = await api.getApprenant(id);
        populateApprenantForm(apprenant);
    } catch (error) {
        console.error('Error loading apprenant:', error);
        showAlert('Erreur lors du chargement de l\'apprenant', 'error');
    }
}

async function deleteApprenant(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet apprenant ? Cette action désactivera l\'apprenant.')) {
        try {
            await api.deleteApprenant(id);
            showAlert('Apprenant désactivé avec succès', 'success');
            loadApprenants();
            
            const apprenantIdInput = document.getElementById('apprenant-id');
            if (isEditing && apprenantIdInput && apprenantIdInput.value === id) {
                hideApprenantForm();
            }
        } catch (error) {
            console.error('Error deleting apprenant:', error);
            showAlert('Erreur lors de la suppression de l\'apprenant', 'error');
        }
    }
}

// Exposer les fonctions globales
window.editApprenant = editApprenant;
window.deleteApprenant = deleteApprenant;