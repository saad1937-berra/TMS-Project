// Formateurs page functionality - VERSION CORRIGÉE
let currentFormateur = null;
let isEditing = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page formateurs chargée');
    
    // Attacher les événements
    document.getElementById('add-formateur-btn').addEventListener('click', handleAddClick);
    document.getElementById('formateur-form-element').addEventListener('submit', handleFormateurSubmit);
    document.getElementById('cancel-btn').addEventListener('click', hideFormateurForm);
    
    // Initialiser le champ photo
    document.getElementById('photo').required = true;
    
    // Charger les formateurs
    loadFormateurs();
});

async function loadFormateurs() {
    try {
        const formateurs = await api.getFormateurs();
        displayFormateurs(formateurs);
    } catch (error) {
        console.error('Error loading formateurs:', error);
        showAlert('Erreur lors du chargement des formateurs', 'error');
    }
}

function displayFormateurs(formateurs) {
    const container = document.getElementById('formateurs-container');
    container.innerHTML = '';
    
    if (formateurs.length === 0) {
        container.innerHTML = '<p>Aucun formateur trouvé</p>';
        return;
    }
    
    formateurs.forEach(formateur => {
        const formateurDiv = document.createElement('div');
        formateurDiv.className = 'formateur-item card';
        formateurDiv.innerHTML = `
            <div class="formateur-header">
                <h3>${formateur.nom} ${formateur.prenom}</h3>
                <span class="specialite">${formateur.specialite}</span>
            </div>
            <div class="formateur-body">
                <p><strong>Email:</strong> ${formateur.email}</p>
                <p><strong>Téléphone:</strong> ${formateur.telephone}</p>
                <p><strong>Bio:</strong> ${formateur.bio || 'Non renseignée'}</p>
                ${formateur.photo ? `
                    <div class="photo-container">
                        <img src="http://localhost:5000/uploads/${formateur.photo}" 
                             alt="Photo de ${formateur.nom}" 
                             class="formateur-photo">
                    </div>
                ` : ''}
            </div>
            <div class="formateur-actions">
                <button class="btn-edit" onclick="editFormateur('${formateur._id}')">
                    ✏️ Modifier
                </button>
                <button class="btn-delete" onclick="deleteFormateur('${formateur._id}')">
                    🗑️ Supprimer
                </button>
            </div>
        `;
        container.appendChild(formateurDiv);
    });
}

function handleAddClick() {
    console.log('Mode AJOUT activé');
    currentFormateur = null;
    isEditing = false;
    showFormateurForm();
}

function showFormateurForm() {
    console.log('Affichage du formulaire, mode:', isEditing ? 'MODIFICATION' : 'AJOUT');
    
    // Cacher la liste
    document.getElementById('formateurs-list').style.display = 'none';
    
    // Afficher le formulaire
    const formSection = document.getElementById('formateur-form');
    formSection.style.display = 'block';
    
    // Mettre à jour le titre
    const title = document.getElementById('form-title');
    title.textContent = isEditing ? 'Modifier le Formateur' : 'Ajouter un Formateur';
    
    // Gérer le champ photo
    const photoInput = document.getElementById('photo');
    const photoHelp = document.getElementById('photo-help');
    
    if (isEditing) {
        // En mode modification, la photo n'est pas obligatoire
        photoInput.required = false;
        if (photoHelp) {
            photoHelp.style.display = 'block';
        }
    } else {
        // En mode ajout, la photo est obligatoire
        photoInput.required = true;
        if (photoHelp) {
            photoHelp.style.display = 'none';
        }
    }
    
    // Réinitialiser le formulaire si c'est en mode ajout
    if (!isEditing) {
        resetFormateurForm();
    }
}

function resetFormateurForm() {
    console.log('Réinitialisation du formulaire');
    
    const form = document.getElementById('formateur-form-element');
    form.reset();
    
    // Réinitialiser le champ caché
    document.getElementById('formateur-id').value = '';
    
    // Réinitialiser les variables d'état
    currentFormateur = null;
    isEditing = false;
    
    // Réinitialiser le titre
    document.getElementById('form-title').textContent = 'Ajouter un Formateur';
    
    // Remettre la photo obligatoire
    document.getElementById('photo').required = true;
}

function hideFormateurForm() {
    console.log('Masquage du formulaire');
    
    // Afficher la liste
    document.getElementById('formateurs-list').style.display = 'block';
    
    // Cacher le formulaire
    document.getElementById('formateur-form').style.display = 'none';
    
    // Réinitialiser le formulaire
    resetFormateurForm();
}

function populateFormateurForm(formateur) {
    console.log('Pré-remplissage du formulaire pour:', formateur.nom);
    
    currentFormateur = formateur;
    isEditing = true;
    
    // Remplir les champs
    document.getElementById('formateur-id').value = formateur._id;
    document.getElementById('nom').value = formateur.nom || '';
    document.getElementById('prenom').value = formateur.prenom || '';
    document.getElementById('specialite').value = formateur.specialite || '';
    document.getElementById('email').value = formateur.email || '';
    document.getElementById('telephone').value = formateur.telephone || '';
    document.getElementById('bio').value = formateur.bio || '';
    
    // Afficher le formulaire
    showFormateurForm();
}

async function handleFormateurSubmit(event) {
    event.preventDefault();
    console.log('Soumission du formulaire, mode:', isEditing ? 'MODIFICATION' : 'AJOUT');
    
    // Créer FormData pour gérer les fichiers
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('nom', document.getElementById('nom').value);
    formData.append('prenom', document.getElementById('prenom').value);
    formData.append('specialite', document.getElementById('specialite').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('telephone', document.getElementById('telephone').value);
    formData.append('bio', document.getElementById('bio').value);
    
    // Ajouter la photo si un fichier est sélectionné
    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
        console.log('Photo ajoutée:', photoFile.name);
    }
    
    const formateurId = document.getElementById('formateur-id').value;
    
    try {
        if (isEditing && formateurId) {
            console.log('Mise à jour du formateur:', formateurId);
            // Mode modification
            await api.updateFormateur(formateurId, formData);
            showAlert('Formateur mis à jour avec succès', 'success');
        } else {
            console.log('Création d\'un nouveau formateur');
            // Mode création - vérifier qu'une photo est fournie
            if (!photoFile) {
                showAlert('Une photo est requise pour créer un formateur', 'error');
                return;
            }
            await api.createFormateur(formData);
            showAlert('Formateur créé avec succès', 'success');
        }
        
        hideFormateurForm();
        loadFormateurs();
    } catch (error) {
        console.error('Error saving formateur:', error);
        showAlert('Erreur lors de la sauvegarde du formateur: ' + error.message, 'error');
    }
}

async function editFormateur(id) {
    console.log('Édition du formateur ID:', id);
    
    try {
        const formateur = await api.getFormateur(id);
        console.log('Formateur chargé:', formateur);
        populateFormateurForm(formateur);
    } catch (error) {
        console.error('Error loading formateur:', error);
        showAlert('Erreur lors du chargement du formateur', 'error');
    }
}

async function deleteFormateur(id) {
    console.log('Suppression du formateur ID:', id);
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce formateur ?')) {
        try {
            await api.deleteFormateur(id);
            showAlert('Formateur supprimé avec succès', 'success');
            loadFormateurs();
        } catch (error) {
            console.error('Error deleting formateur:', error);
            showAlert('Erreur lors de la suppression du formateur', 'error');
        }
    }
}

// Exposer les fonctions globales
window.editFormateur = editFormateur;
window.deleteFormateur = deleteFormateur;