// Formations page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadFormations();
    loadFormateurs();

    document.getElementById('add-formation-btn').addEventListener('click', showFormationForm);
    document.getElementById('formation-form-element').addEventListener('submit', handleFormationSubmit);
    document.getElementById('cancel-btn').addEventListener('click', hideFormationForm);
});

async function loadFormations() {
    try {
        const formations = await api.getFormations();
        displayFormations(formations);
    } catch (error) {
        console.error('Error loading formations:', error);
        showAlert('Erreur lors du chargement des formations');
    }
}

async function loadFormateurs() {
    try {
        const formateurs = await api.getFormateurs();
        populateFormateurSelect(formateurs);
    } catch (error) {
        console.error('Error loading formateurs:', error);
    }
}

function displayFormations(formations) {
    const container = document.getElementById('formations-container');
    container.innerHTML = '';

    formations.forEach(formation => {
        const formationDiv = document.createElement('div');
        formationDiv.className = 'formation-item';
        formationDiv.innerHTML = `
            <h3>${formation.titre}</h3>
            <p>${formation.description}</p>
            <p>Catégorie: ${formation.categorie}</p>
            <p>Durée: ${formation.dureeHeures} heures</p>
            <p>Niveau: ${formation.niveau}</p>
            <p>Capacité: ${formation.capacite}</p>
            <button onclick="editFormation('${formation._id}')">Modifier</button>
            <button onclick="deleteFormation('${formation._id}')">Supprimer</button>
        `;
        container.appendChild(formationDiv);
    });
}

function populateFormateurSelect(formateurs) {
    const select = document.getElementById('formateurId');
    select.innerHTML = '<option value="">Sélectionner un formateur</option>';
    formateurs.forEach(formateur => {
        const option = document.createElement('option');
        option.value = formateur._id;
        option.textContent = `${formateur.nom} ${formateur.prenom}`;
        select.appendChild(option);
    });
}

function showFormationForm(formation = null) {
    document.getElementById('formations-list').style.display = 'none';
    document.getElementById('formation-form').style.display = 'block';

    if (formation) {
        document.getElementById('form-title').textContent = 'Modifier la Formation';
        populateFormationForm(formation);
    } else {
        document.getElementById('form-title').textContent = 'Ajouter une Formation';
        document.getElementById('formation-form-element').reset();
    }
}

function hideFormationForm() {
    document.getElementById('formation-form').style.display = 'none';
    document.getElementById('formations-list').style.display = 'block';
}

function populateFormationForm(formation) {
    document.getElementById('formation-id').value = formation._id;
    document.getElementById('titre').value = formation.titre;
    document.getElementById('description').value = formation.description;
    document.getElementById('categorie').value = formation.categorie;
    document.getElementById('dureeHeures').value = formation.dureeHeures;
    document.getElementById('dateDebut').value = formation.dateDebut.split('T')[0];
    document.getElementById('dateFin').value = formation.dateFin.split('T')[0];
    document.getElementById('niveau').value = formation.niveau;
    document.getElementById('formateurId').value = formation.formateurId._id;
    document.getElementById('capacite').value = formation.capacite;
}

async function handleFormationSubmit(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('titre', document.getElementById('titre').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('categorie', document.getElementById('categorie').value);
    formData.append('dureeHeures', document.getElementById('dureeHeures').value);
    formData.append('dateDebut', document.getElementById('dateDebut').value);
    formData.append('dateFin', document.getElementById('dateFin').value);
    formData.append('niveau', document.getElementById('niveau').value);
    formData.append('formateurId', document.getElementById('formateurId').value);
    formData.append('capacite', document.getElementById('capacite').value);

    const imageFile = document.getElementById('imageFormation').files[0];
    if (imageFile) {
        formData.append('imageFormation', imageFile);
    }

    const formationId = document.getElementById('formation-id').value;

    try {
        if (formationId) {
            await api.updateFormation(formationId, Object.fromEntries(formData));
            showAlert('Formation mise à jour avec succès');
        } else {
            await api.createFormation(Object.fromEntries(formData));
            showAlert('Formation créée avec succès');
        }
        hideFormationForm();
        loadFormations();
    } catch (error) {
        console.error('Error saving formation:', error);
        showAlert('Erreur lors de la sauvegarde de la formation');
    }
}

async function editFormation(id) {
    try {
        const formation = await api.getFormation(id);
        showFormationForm(formation);
    } catch (error) {
        console.error('Error loading formation:', error);
        showAlert('Erreur lors du chargement de la formation');
    }
}

async function deleteFormation(id) {
    if (confirmAction('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
        try {
            await api.deleteFormation(id);
            showAlert('Formation supprimée avec succès');
            loadFormations();
        } catch (error) {
            console.error('Error deleting formation:', error);
            showAlert('Erreur lors de la suppression de la formation');
        }
    }
}
