// Inscriptions page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadInscriptions();
    loadApprenants();
    loadFormations();

    document.getElementById('add-inscription-btn').addEventListener('click', showInscriptionForm);
    document.getElementById('inscription-form-element').addEventListener('submit', handleInscriptionSubmit);
    document.getElementById('cancel-btn').addEventListener('click', hideInscriptionForm);
});

async function loadInscriptions() {
    try {
        const inscriptions = await api.getInscriptions();
        displayInscriptions(inscriptions);
    } catch (error) {
        console.error('Error loading inscriptions:', error);
        showAlert('Erreur lors du chargement des inscriptions');
    }
}

async function loadApprenants() {
    try {
        const apprenants = await api.getApprenants();
        populateApprenantSelect(apprenants);
    } catch (error) {
        console.error('Error loading apprenants:', error);
    }
}

async function loadFormations() {
    try {
        const formations = await api.getFormations();
        populateFormationSelect(formations);
    } catch (error) {
        console.error('Error loading formations:', error);
    }
}

function displayInscriptions(inscriptions) {
    const container = document.getElementById('inscriptions-container');
    container.innerHTML = '';

    inscriptions.forEach(inscription => {
        const inscriptionDiv = document.createElement('div');
        inscriptionDiv.className = 'inscription-item';
        inscriptionDiv.innerHTML = `
            <h3>${inscription.apprenantId.nom} ${inscription.apprenantId.prenom}</h3>
            <p>Formation: ${inscription.formationId.titre}</p>
            <p>Date d'inscription: ${formatDate(inscription.dateInscription)}</p>
            <p>Statut: ${inscription.statut}</p>
            <p>Paiement: ${inscription.paiement}</p>
            <button onclick="deleteInscription('${inscription._id}')">Annuler</button>
        `;
        container.appendChild(inscriptionDiv);
    });
}

function populateApprenantSelect(apprenants) {
    const select = document.getElementById('apprenantId');
    select.innerHTML = '<option value="">Sélectionner un apprenant</option>';
    apprenants.forEach(apprenant => {
        const option = document.createElement('option');
        option.value = apprenant._id;
        option.textContent = `${apprenant.nom} ${apprenant.prenom}`;
        select.appendChild(option);
    });
}

function populateFormationSelect(formations) {
    const select = document.getElementById('formationId');
    select.innerHTML = '<option value="">Sélectionner une formation</option>';
    formations.forEach(formation => {
        const option = document.createElement('option');
        option.value = formation._id;
        option.textContent = formation.titre;
        select.appendChild(option);
    });
}

function showInscriptionForm() {
    document.getElementById('inscriptions-list').style.display = 'none';
    document.getElementById('inscription-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Ajouter une Inscription';
    document.getElementById('inscription-form-element').reset();
}

function hideInscriptionForm() {
    document.getElementById('inscription-form').style.display = 'none';
    document.getElementById('inscriptions-list').style.display = 'block';
}

async function handleInscriptionSubmit(event) {
    event.preventDefault();

    const inscriptionData = {
        apprenantId: document.getElementById('apprenantId').value,
        formationId: document.getElementById('formationId').value
    };

    try {
        await api.createInscription(inscriptionData);
        showAlert('Inscription créée avec succès');
        hideInscriptionForm();
        loadInscriptions();
    } catch (error) {
        console.error('Error creating inscription:', error);
        showAlert('Erreur lors de la création de l\'inscription');
    }
}

async function deleteInscription(id) {
    if (confirmAction('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
        try {
            await api.deleteInscription(id);
            showAlert('Inscription annulée avec succès');
            loadInscriptions();
        } catch (error) {
            console.error('Error deleting inscription:', error);
            showAlert('Erreur lors de l\'annulation de l\'inscription');
        }
    }
}
