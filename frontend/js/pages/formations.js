// formations.js (frontend) - VERSION CORRIGÉE
let currentFormation = null;
let isEditing = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page formations chargée');
    
    // Attacher les événements
    document.getElementById('add-formation-btn').addEventListener('click', handleAddClick);
    document.getElementById('formation-form-element').addEventListener('submit', handleFormationSubmit);
    document.getElementById('cancel-btn').addEventListener('click', hideFormationForm);
    document.getElementById('delete-btn').addEventListener('click', handleDeleteClick);
    
    // Initialiser
    loadFormateurs();
    loadFormations();
});

async function loadFormations() {
    try {
        const formations = await api.getFormations();
        displayFormations(formations);
    } catch (error) {
        console.error('Error loading formations:', error);
        showAlert('Erreur lors du chargement des formations', 'error');
    }
}

async function loadFormateurs() {
    try {
        const formateurs = await api.getFormateurs();
        updateFormateurSelect(formateurs);
    } catch (error) {
        console.error('Error loading formateurs:', error);
        showAlert('Erreur lors du chargement des formateurs', 'error');
    }
}

function updateFormateurSelect(formateurs) {
    const select = document.getElementById('formateurId');
    select.innerHTML = '<option value="">Sélectionnez un formateur</option>';
    
    formateurs.forEach(formateur => {
        const option = document.createElement('option');
        option.value = formateur._id;
        option.textContent = `${formateur.nom} ${formateur.prenom} - ${formateur.specialite}`;
        select.appendChild(option);
    });
}

function displayFormations(formations) {
    const container = document.getElementById('formations-container');
    container.innerHTML = '';
    
    if (formations.length === 0) {
        container.innerHTML = '<p>Aucune formation trouvée</p>';
        return;
    }
    
    formations.forEach(formation => {
        const formationDiv = document.createElement('div');
        formationDiv.className = 'formation-item';
        
        const startDate = new Date(formation.dateDebut).toLocaleDateString('fr-FR');
        const endDate = new Date(formation.dateFin).toLocaleDateString('fr-FR');
        const formateurName = formation.formateurId ? 
            `${formation.formateurId.nom} ${formation.formateurId.prenom}` : 
            'Non assigné';
        
        formationDiv.innerHTML = `
            <div class="formation-header">
                <h3>${formation.titre}</h3>
                <span class="formation-category">${formation.categorie}</span>
            </div>
            <p><strong>Description:</strong> ${formation.description.substring(0, 100)}${formation.description.length > 100 ? '...' : ''}</p>
            <p><strong>Durée:</strong> ${formation.dureeHeures} heures</p>
            <p><strong>Niveau:</strong> ${formation.niveau}</p>
            <p><strong>Formateur:</strong> ${formateurName}</p>
            <p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
            <p><strong>Capacité:</strong> ${formation.capacite} places</p>
            ${formation.imageFormation ? `
                <div class="formation-image">
                    <img src="http://localhost:5000/uploads/${formation.imageFormation}" 
                         alt="${formation.titre}" 
                         style="max-width: 200px; max-height: 150px;">
                </div>
            ` : ''}
            <div class="formation-actions">
                <button class="btn-edit" onclick="editFormation('${formation._id}')">Modifier</button>
                <button class="btn-delete" onclick="deleteFormation('${formation._id}')">Supprimer</button>
            </div>
        `;
        container.appendChild(formationDiv);
    });
}

function handleAddClick() {
    console.log('Mode AJOUT activé');
    currentFormation = null;
    isEditing = false;
    showFormationForm();
}

function showFormationForm() {
    console.log('Affichage du formulaire, mode:', isEditing ? 'MODIFICATION' : 'AJOUT');
    
    // Cacher la liste
    document.getElementById('formations-list').style.display = 'none';
    
    // Afficher le formulaire
    const formSection = document.getElementById('formation-form');
    formSection.style.display = 'block';
    
    // Mettre à jour le titre
    const title = document.getElementById('form-title');
    title.textContent = isEditing ? 'Modifier la Formation' : 'Ajouter une Formation';
    
    // Gérer le champ image
    const imageInput = document.getElementById('imageFormation');
    const imageHelp = document.getElementById('image-help');
    
    if (isEditing) {
        // En mode modification, l'image n'est pas obligatoire
        imageInput.required = false;
        if (imageHelp) {
            imageHelp.style.display = 'block';
        }
    } else {
        // En mode ajout, l'image est optionnelle
        imageInput.required = false;
        if (imageHelp) {
            imageHelp.style.display = 'none';
        }
    }
    
    // Réinitialiser le formulaire si c'est en mode ajout
    if (!isEditing) {
        resetFormationForm();
    }
}

function resetFormationForm() {
    console.log('Réinitialisation du formulaire');
    
    const form = document.getElementById('formation-form-element');
    form.reset();
    
    // Réinitialiser le champ caché
    document.getElementById('formation-id').value = '';
    
    // Cacher l'image actuelle
    document.getElementById('current-image').style.display = 'none';
    document.getElementById('current-image-preview').src = '';
    
    // Cacher le bouton supprimer
    document.getElementById('delete-btn').style.display = 'none';
    
    // Réinitialiser les variables d'état
    currentFormation = null;
    isEditing = false;
    
    // Remettre le titre
    document.getElementById('form-title').textContent = 'Ajouter une Formation';
    
    // Définir la date minimale à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateDebut').min = today;
    document.getElementById('dateFin').min = today;
}

function hideFormationForm() {
    console.log('Masquage du formulaire');
    
    // Afficher la liste
    document.getElementById('formations-list').style.display = 'block';
    
    // Cacher le formulaire
    document.getElementById('formation-form').style.display = 'none';
    
    // Réinitialiser le formulaire
    resetFormationForm();
}

function populateFormationForm(formation) {
    console.log('Pré-remplissage du formulaire pour:', formation.titre);
    
    currentFormation = formation;
    isEditing = true;
    
    // Remplir les champs
    document.getElementById('formation-id').value = formation._id;
    document.getElementById('titre').value = formation.titre || '';
    document.getElementById('description').value = formation.description || '';
    document.getElementById('categorie').value = formation.categorie || '';
    document.getElementById('dureeHeures').value = formation.dureeHeures || '';
    document.getElementById('dateDebut').value = formation.dateDebut ? 
        new Date(formation.dateDebut).toISOString().split('T')[0] : '';
    document.getElementById('dateFin').value = formation.dateFin ? 
        new Date(formation.dateFin).toISOString().split('T')[0] : '';
    document.getElementById('niveau').value = formation.niveau || '';
    document.getElementById('formateurId').value = formation.formateurId ? formation.formateurId._id : '';
    document.getElementById('capacite').value = formation.capacite || '';
    
    // Afficher l'image actuelle si elle existe
    if (formation.imageFormation) {
        document.getElementById('current-image').style.display = 'block';
        document.getElementById('current-image-preview').src = 
            `http://localhost:5000/uploads/formations/${formation.imageFormation}`;
    } else {
        document.getElementById('current-image').style.display = 'none';
    }
    
    // Afficher le bouton supprimer
    document.getElementById('delete-btn').style.display = 'inline-block';
    
    // Afficher le formulaire
    showFormationForm();
}

async function handleFormationSubmit(event) {
    event.preventDefault();
    console.log('Soumission du formulaire, mode:', isEditing ? 'MODIFICATION' : 'AJOUT');
    
    // Créer FormData pour gérer les fichiers
    const formData = new FormData();
    
    // Ajouter les champs texte
    const fields = [
        'titre', 'description', 'categorie', 'dureeHeures',
        'dateDebut', 'dateFin', 'niveau', 'formateurId', 'capacite'
    ];
    
    fields.forEach(field => {
        const value = document.getElementById(field).value;
        if (value) {
            formData.append(field, value);
        }
    });
    
    // Ajouter l'image si un fichier est sélectionné
    const imageFile = document.getElementById('imageFormation').files[0];
    if (imageFile) {
        formData.append('imageFormation', imageFile);
        console.log('Image ajoutée:', imageFile.name);
    }
    
    const formationId = document.getElementById('formation-id').value;
    
    try {
        if (isEditing && formationId) {
            console.log('Mise à jour de la formation:', formationId);
            // Mode modification - utiliser FormData directement
            await api.updateFormation(formationId, formData);
            showAlert('Formation mise à jour avec succès', 'success');
        } else {
            console.log('Création d\'une nouvelle formation');
            // Mode création - utiliser FormData directement
            await api.createFormation(formData);
            showAlert('Formation créée avec succès', 'success');
        }
        
        hideFormationForm();
        loadFormations();
    } catch (error) {
        console.error('Error saving formation:', error);
        showAlert('Erreur lors de la sauvegarde de la formation: ' + (error.message || ''), 'error');
    }
}

async function editFormation(id) {
    console.log('Édition de la formation ID:', id);
    
    try {
        const formation = await api.getFormation(id);
        console.log('Formation chargée:', formation);
        populateFormationForm(formation);
    } catch (error) {
        console.error('Error loading formation:', error);
        showAlert('Erreur lors du chargement de la formation', 'error');
    }
}

async function deleteFormation(id) {
    console.log('Suppression de la formation ID:', id);
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
        try {
            await api.deleteFormation(id);
            showAlert('Formation supprimée avec succès', 'success');
            loadFormations();
        } catch (error) {
            console.error('Error deleting formation:', error);
            showAlert('Erreur lors de la suppression de la formation', 'error');
        }
    }
}

async function handleDeleteClick() {
    const formationId = document.getElementById('formation-id').value;
    if (!formationId) return;
    
    deleteFormation(formationId);
}

// Exposer les fonctions globales
window.editFormation = editFormation;
window.deleteFormation = deleteFormation;