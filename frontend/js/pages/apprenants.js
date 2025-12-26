// Apprenants page functionality
// Apprenants page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadApprenants();

    document.getElementById('add-apprenant-btn').addEventListener('click', () => showApprenantForm());
    document.getElementById('apprenant-form-element').addEventListener('submit', handleApprenantSubmit);
    document.getElementById('cancel-btn').addEventListener('click', hideApprenantForm);
});

async function loadApprenants() {
    try {
        // Note: api.getApprenants() retourne un objet avec une propriété 'apprenants'
        const response = await api.getApprenants();
        const apprenants = response.apprenants || response; // Gérer les deux cas
        displayApprenants(apprenants);
    } catch (error) {
        console.error('Error loading apprenants:', error);
        showAlert('Erreur lors du chargement des apprenants');
    }
}

function displayApprenants(apprenants) {
    const container = document.getElementById('apprenants-container');
    container.innerHTML = '';

    if (!apprenants || apprenants.length === 0) {
        container.innerHTML = '<p>Aucun apprenant trouvé</p>';
        return;
    }

    apprenants.forEach(apprenant => {
        const apprenantDiv = document.createElement('div');
        apprenantDiv.className = 'apprenant-item';
        apprenantDiv.innerHTML = `
            <h3>${apprenant.nom} ${apprenant.prenom}</h3>
            <p>Email: ${apprenant.email}</p>
            <p>Âge: ${apprenant.age}</p>
            <p>Niveau d'étude: ${apprenant.niveauEtude || 'Non spécifié'}</p>
            <p>Statut: ${apprenant.statut || 'Actif'}</p>
            ${apprenant.photo ? `<img src="http://localhost:5000/uploads/${apprenant.photo}" alt="Photo" style="width: 100px; height: 100px; object-fit: cover;">` : ''}
            <div>
                <button onclick="editApprenant('${apprenant._id}')">Modifier</button>
                <button onclick="deleteApprenant('${apprenant._id}')">Supprimer</button>
            </div>
        `;
        container.appendChild(apprenantDiv);
    });
}

function showApprenantForm(apprenant = null) {
    document.getElementById('apprenants-list').style.display = 'none';
    document.getElementById('apprenant-form').style.display = 'block';

    if (apprenant && apprenant._id) {
        // Mode édition
        document.getElementById('form-title').textContent = 'Modifier l\'Apprenant';
        populateApprenantForm(apprenant);
    } else {
        // Mode ajout
        document.getElementById('form-title').textContent = 'Ajouter un Apprenant';
        // Réinitialiser le formulaire
        document.getElementById('apprenant-form-element').reset();
        // Effacer l'ID caché
        document.getElementById('apprenant-id').value = '';
        // Réinitialiser le champ photo
        document.getElementById('photo').value = '';
    }
}

function hideApprenantForm() {
    document.getElementById('apprenant-form').style.display = 'none';
    document.getElementById('apprenants-list').style.display = 'block';
    // Réinitialiser le formulaire
    document.getElementById('apprenant-form-element').reset();
}

function populateApprenantForm(apprenant) {
    document.getElementById('apprenant-id').value = apprenant._id;
    document.getElementById('nom').value = apprenant.nom || '';
    document.getElementById('prenom').value = apprenant.prenom || '';
    
    // Formater la date pour l'input type="date"
    if (apprenant.dateNaissance) {
        const date = new Date(apprenant.dateNaissance);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('dateNaissance').value = formattedDate;
    } else {
        document.getElementById('dateNaissance').value = '';
    }
    
    document.getElementById('age').value = apprenant.age || '';
    document.getElementById('email').value = apprenant.email || '';
    document.getElementById('niveauEtude').value = apprenant.niveauEtude || '';
    
    // Note: Ne pas modifier le champ photo lors de l'édition
    // L'utilisateur doit explicitement choisir une nouvelle photo
}

async function handleApprenantSubmit(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('nom', document.getElementById('nom').value);
    formData.append('prenom', document.getElementById('prenom').value);
    formData.append('dateNaissance', document.getElementById('dateNaissance').value);
    formData.append('age', parseInt(document.getElementById('age').value));
    formData.append('email', document.getElementById('email').value);
    formData.append('niveauEtude', document.getElementById('niveauEtude').value);

    // Ajouter le statut par défaut
    formData.append('statut', 'Actif');

    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    const apprenantId = document.getElementById('apprenant-id').value;

    try {
        if (apprenantId) {
            // Mode édition
            await api.updateApprenant(apprenantId, formData);
            showAlert('Apprenant mis à jour avec succès');
        } else {
            // Mode création - la photo est requise
            if (!photoFile) {
                showAlert('La photo est requise pour créer un nouvel apprenant');
                return;
            }
            await api.createApprenant(formData);
            showAlert('Apprenant créé avec succès');
        }
        hideApprenantForm();
        loadApprenants();
    } catch (error) {
        console.error('Error saving apprenant:', error);
        showAlert(`Erreur lors de la sauvegarde: ${error.message}`);
    }
}

async function editApprenant(id) {
    try {
        const apprenant = await api.getApprenant(id);
        showApprenantForm(apprenant);
    } catch (error) {
        console.error('Error loading apprenant:', error);
        showAlert('Erreur lors du chargement de l\'apprenant');
    }
}

async function deleteApprenant(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet apprenant ?')) {
        try {
            await api.deleteApprenant(id);
            showAlert('Apprenant supprimé avec succès');
            loadApprenants();
        } catch (error) {
            console.error('Error deleting apprenant:', error);
            showAlert('Erreur lors de la suppression de l\'apprenant');
        }
    }
}

// Exporter les fonctions pour les rendre accessibles depuis HTML
window.editApprenant = editApprenant;
window.deleteApprenant = deleteApprenant;

async function loadApprenants() {
    try {
        const apprenants = await api.getApprenants();
        displayApprenants(apprenants);
    } catch (error) {
        console.error('Error loading apprenants:', error);
        showAlert('Erreur lors du chargement des apprenants');
    }
}

function displayApprenants(apprenants) {
    const container = document.getElementById('apprenants-container');
    container.innerHTML = '';

    apprenants.forEach(apprenant => {
        const apprenantDiv = document.createElement('div');
        apprenantDiv.className = 'apprenant-item';
        apprenantDiv.innerHTML = `
            <h3>${apprenant.nom} ${apprenant.prenom}</h3>
            <p>Date de naissance: ${new Date(apprenant.dateNaissance).toLocaleDateString()}</p>
            <p>Âge: ${apprenant.age}</p>
            <p>Email: ${apprenant.email}</p>
            <p>Niveau d'étude: ${apprenant.niveauEtude}</p>
            ${apprenant.photo ? `<img src="http://localhost:5000/${apprenant.photo}" alt="Photo" style="width: 100px; height: 100px; object-fit: cover;">` : ''}
            <button onclick="editApprenant('${apprenant._id}')">Modifier</button>
            <button onclick="deleteApprenant('${apprenant._id}')">Supprimer</button>
        `;
        container.appendChild(apprenantDiv);
    });
}

function showApprenantForm(apprenant = null) {
    document.getElementById('apprenants-list').style.display = 'none';
    document.getElementById('apprenant-form').style.display = 'block';

    if (apprenant) {
        document.getElementById('form-title').textContent = 'Modifier l\'Apprenant';
        populateApprenantForm(apprenant);
    } else {
        document.getElementById('form-title').textContent = 'Ajouter un Apprenant';
        document.getElementById('apprenant-form-element').reset();
    }
}

function hideApprenantForm() {
    document.getElementById('apprenant-form').style.display = 'none';
    document.getElementById('apprenants-list').style.display = 'block';
}

function populateApprenantForm(apprenant) {
    document.getElementById('apprenant-id').value = apprenant._id;
    document.getElementById('nom').value = apprenant.nom;
    document.getElementById('prenom').value = apprenant.prenom;
    document.getElementById('dateNaissance').value = 
        new Date(apprenant.dateNaissance).toISOString().split('T')[0];
    document.getElementById('age').value = apprenant.age;
    document.getElementById('email').value = apprenant.email;
    document.getElementById('telephone').value = apprenant.telephone || '';
    document.getElementById('niveauEtude').value = apprenant.niveauEtude || '';
    document.getElementById('profession').value = apprenant.profession || '';
}
async function handleApprenantSubmit(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('nom', document.getElementById('nom').value);
    formData.append('prenom', document.getElementById('prenom').value);
    formData.append('dateNaissance', document.getElementById('dateNaissance').value);
    formData.append('age', parseInt(document.getElementById('age').value));
    formData.append('email', document.getElementById('email').value);
    formData.append('niveauEtude', document.getElementById('niveauEtude').value);
    formData.append('statut', 'Actif'); // Ajouter une valeur par défaut

    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    const apprenantId = document.getElementById('apprenant-id').value;

    try {
        if (apprenantId) {
            // Envoyer FormData directement, pas Object.fromEntries
            await api.updateApprenant(apprenantId, formData);
            showAlert('Apprenant mis à jour avec succès');
        } else {
            // Envoyer FormData directement
            await api.createApprenant(formData);
            showAlert('Apprenant créé avec succès');
        }
        hideApprenantForm();
        loadApprenants();
    } catch (error) {
        console.error('Error saving apprenant:', error);
        showAlert('Erreur lors de la sauvegarde de l\'apprenant');
    }
}

async function editApprenant(id) {
    try {
        const apprenant = await api.getApprenant(id);
        showApprenantForm(apprenant);
    } catch (error) {
        console.error('Error loading apprenant:', error);
        showAlert('Erreur lors du chargement de l\'apprenant');
    }
}

async function deleteApprenant(id) {
    if (confirmAction('Êtes-vous sûr de vouloir supprimer cet apprenant ?')) {
        try {
            await api.deleteApprenant(id);
            showAlert('Apprenant supprimé avec succès');
            loadApprenants();
        } catch (error) {
            console.error('Error deleting apprenant:', error);
            showAlert('Erreur lors de la suppression de l\'apprenant');
        }
    }
}
