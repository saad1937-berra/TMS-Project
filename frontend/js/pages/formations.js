let currentFormation = null;
let isEditing = false;

document.addEventListener('DOMContentLoaded', function() {
    const addFormationBtn = document.getElementById('add-formation-btn');
    const formationFormElement = document.getElementById('formation-form-element');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');
    
    if (addFormationBtn) {
        addFormationBtn.addEventListener('click', handleAddClick);
    }
    
    if (formationFormElement) {
        formationFormElement.addEventListener('submit', handleFormationSubmit);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideFormationForm);
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteClick);
    }
    
    loadFormateurs();
    loadFormations();
    
    const today = new Date().toISOString().split('T')[0];
    const dateDebutInput = document.getElementById('dateDebut');
    const dateFinInput = document.getElementById('dateFin');
    
    if (dateDebutInput) {
        dateDebutInput.min = today;
    }
    
    if (dateFinInput) {
        dateFinInput.min = today;
    }
    
    if (dateDebutInput) {
        dateDebutInput.addEventListener('change', function() {
            if (dateFinInput) {
                dateFinInput.min = this.value;
            }
        });
    }
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
    if (!select) return;
    
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
    if (!container) return;
    
    container.innerHTML = '';
    
    if (formations.length === 0) {
        container.innerHTML = '<p class="no-data">Aucune formation trouvée</p>';
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
                         class="formation-thumbnail">
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
    currentFormation = null;
    isEditing = false;
    showFormationForm();
}

function showFormationForm() {
    const formationsList = document.getElementById('formations-list');
    if (formationsList) {
        formationsList.style.display = 'none';
    }
    
    const formSection = document.getElementById('formation-form');
    if (formSection) {
        formSection.style.display = 'block';
    }
    
    const title = document.getElementById('form-title');
    if (title) {
        title.textContent = isEditing ? 'Modifier la Formation' : 'Ajouter une Formation';
    }
    
    const imageInput = document.getElementById('imageFormation');
    const imageHelp = document.getElementById('image-help');
    
    if (imageInput) {
        imageInput.required = false;
    }
    
    if (imageHelp) {
        imageHelp.style.display = isEditing ? 'block' : 'none';
    }
    
    if (!isEditing) {
        resetFormationForm();
    }
}

function resetFormationForm() {
    const form = document.getElementById('formation-form-element');
    if (form) {
        form.reset();
    }
    
    const formationIdInput = document.getElementById('formation-id');
    if (formationIdInput) {
        formationIdInput.value = '';
    }
    
    const currentImageDiv = document.getElementById('current-image');
    if (currentImageDiv) {
        currentImageDiv.style.display = 'none';
    }
    
    const currentImagePreview = document.getElementById('current-image-preview');
    if (currentImagePreview) {
        currentImagePreview.src = '';
    }
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
    
    currentFormation = null;
    isEditing = false;
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Ajouter une Formation';
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dateDebutInput = document.getElementById('dateDebut');
    const dateFinInput = document.getElementById('dateFin');
    
    if (dateDebutInput) {
        dateDebutInput.min = today;
        dateDebutInput.value = '';
    }
    
    if (dateFinInput) {
        dateFinInput.min = today;
        dateFinInput.value = '';
    }
    
    const formateurSelect = document.getElementById('formateurId');
    if (formateurSelect) {
        formateurSelect.selectedIndex = 0;
    }
    
    const niveauSelect = document.getElementById('niveau');
    if (niveauSelect) {
        niveauSelect.selectedIndex = 0;
    }
}

function hideFormationForm() {
    const formationsList = document.getElementById('formations-list');
    if (formationsList) {
        formationsList.style.display = 'block';
    }
    
    const formSection = document.getElementById('formation-form');
    if (formSection) {
        formSection.style.display = 'none';
    }
    
    resetFormationForm();
}

function populateFormationForm(formation) {
    currentFormation = formation;
    isEditing = true;
    
    const formationIdInput = document.getElementById('formation-id');
    if (formationIdInput) {
        formationIdInput.value = formation._id;
    }
    
    document.getElementById('titre').value = formation.titre || '';
    document.getElementById('description').value = formation.description || '';
    document.getElementById('categorie').value = formation.categorie || '';
    document.getElementById('dureeHeures').value = formation.dureeHeures || '';
    
    const startDate = formation.dateDebut ? new Date(formation.dateDebut).toISOString().split('T')[0] : '';
    const endDate = formation.dateFin ? new Date(formation.dateFin).toISOString().split('T')[0] : '';
    
    const dateDebutInput = document.getElementById('dateDebut');
    const dateFinInput = document.getElementById('dateFin');
    
    if (dateDebutInput) {
        dateDebutInput.value = startDate;
    }
    
    if (dateFinInput) {
        dateFinInput.value = endDate;
        dateFinInput.min = startDate;
    }
    
    document.getElementById('niveau').value = formation.niveau || '';
    document.getElementById('formateurId').value = formation.formateurId ? formation.formateurId._id : '';
    document.getElementById('capacite').value = formation.capacite || '';
    
    const currentImageDiv = document.getElementById('current-image');
    const currentImagePreview = document.getElementById('current-image-preview');
    
    if (formation.imageFormation && currentImageDiv && currentImagePreview) {
        currentImageDiv.style.display = 'block';
        const imageUrl = `http://localhost:5000/uploads/${formation.imageFormation}`;
        currentImagePreview.src = imageUrl;
        currentImagePreview.alt = formation.titre;
    } else if (currentImageDiv) {
        currentImageDiv.style.display = 'none';
    }
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.style.display = 'inline-block';
    }
    
    showFormationForm();
}

async function handleFormationSubmit(event) {
    event.preventDefault();
    
    
    const formData = new FormData();
    
    const fields = [
        'titre', 'description', 'categorie', 'dureeHeures',
        'dateDebut', 'dateFin', 'niveau', 'formateurId', 'capacite'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value) {
            formData.append(field, element.value);
        }
    });
    
    const imageFileInput = document.getElementById('imageFormation');
    if (imageFileInput && imageFileInput.files.length > 0) {
        formData.append('imageFormation', imageFileInput.files[0]);
    }
    
    try {
        let result;
        
        if (isEditing && currentFormation) {
            // MODE MISE À JOUR
            result = await api.updateFormation(currentFormation._id, formData);
            showAlert('Formation modifiée avec succès', 'success');
        } else {
            // MODE CRÉATION
            result = await api.createFormation(formData);
            showAlert('Formation créée avec succès', 'success');
        }
        
        hideFormationForm();
        loadFormations();
        
    } catch (error) {
        console.error('Erreur:', error);
        const message = error.data?.message || error.message || 'Une erreur est survenue';
        showAlert(message, 'error');
    }
}

async function editFormation(id) {
    try {
        const formation = await api.getFormation(id);
        populateFormationForm(formation);
    } catch (error) {
        console.error('Error loading formation:', error);
        showAlert('Erreur lors du chargement de la formation', 'error');
    }
}

async function deleteFormation(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.')) {
        try {
            await api.deleteFormation(id);
            showAlert('Formation supprimée avec succès', 'success');
            loadFormations();
            
            const formationIdInput = document.getElementById('formation-id');
            if (isEditing && formationIdInput && formationIdInput.value === id) {
                hideFormationForm();
            }
        } catch (error) {
            console.error('Error deleting formation:', error);
            showAlert('Erreur lors de la suppression de la formation', 'error');
        }
    }
}

async function handleDeleteClick() {
    const formationIdInput = document.getElementById('formation-id');
    const formationId = formationIdInput ? formationIdInput.value : '';
    if (!formationId) return;
    
    deleteFormation(formationId);
}

window.editFormation = editFormation;
window.deleteFormation = deleteFormation;