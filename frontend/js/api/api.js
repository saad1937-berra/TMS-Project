const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                ...options.headers
            },
            ...options
        };

        // Ne pas définir Content-Type pour FormData (le navigateur le fera automatiquement avec boundary)
        if (!(options.body instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, config);
            
            // Si la réponse n'est pas OK, essayer de lire le message d'erreur
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Si le corps n'est pas du JSON, utiliser le statut
                }
                throw new Error(errorMessage);
            }
            
            // Pour les réponses DELETE (204 No Content), ne pas essayer de parser JSON
            if (response.status === 204) {
                return { success: true };
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Formations - MODIFIÉ pour utiliser FormData
    async getFormations() {
        return this.request('/formations');
    }

    async getFormation(id) {
        return this.request(`/formations/${id}`);
    }

    async createFormation(data) {
        // data doit être un FormData pour inclure les fichiers
        return this.request('/formations', {
            method: 'POST',
            body: data  // FormData directement, pas de JSON.stringify
        });
    }

    async updateFormation(id, data) {
        // data doit être un FormData pour inclure les fichiers
        return this.request(`/formations/${id}`, {
            method: 'PUT',
            body: data  // FormData directement, pas de JSON.stringify
        });
    }

    async deleteFormation(id) {
        return this.request(`/formations/${id}`, {
            method: 'DELETE'
        });
    }

    // Formateurs - OK (déjà avec FormData)
    async getFormateurs() {
        return this.request('/formateurs');
    }

    async getFormateur(id) {
        return this.request(`/formateurs/${id}`);
    }

    async createFormateur(data) {
        // Si data est déjà un FormData, l'utiliser directement
        if (data instanceof FormData) {
            return this.request('/formateurs', {
                method: 'POST',
                body: data
            });
        }
        
        // Sinon, créer un FormData à partir de l'objet
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        
        return this.request('/formateurs', {
            method: 'POST',
            body: formData
        });
    }

    async updateFormateur(id, data) {
        // Si data est déjà un FormData, l'utiliser directement
        if (data instanceof FormData) {
            return this.request(`/formateurs/${id}`, {
                method: 'PUT',
                body: data
            });
        }
        
        // Sinon, créer un FormData à partir de l'objet
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        
        return this.request(`/formateurs/${id}`, {
            method: 'PUT',
            body: formData
        });
    }

    async deleteFormateur(id) {
        return this.request(`/formateurs/${id}`, {
            method: 'DELETE'
        });
    }

    // Apprenants - MODIFIÉ pour être cohérent avec FormData
    async getApprenants() {
        return this.request('/apprenants');
    }

    async getApprenant(id) {
        return this.request(`/apprenants/${id}`);
    }

    async createApprenant(data) {
        // Si data est déjà un FormData, l'utiliser directement
        if (data instanceof FormData) {
            return this.request('/apprenants', {
                method: 'POST',
                body: data
            });
        }
        
        // Sinon, créer un FormData à partir de l'objet
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        
        return this.request('/apprenants', {
            method: 'POST',
            body: formData
        });
    }

    async updateApprenant(id, data) {
        // Si data est déjà un FormData, l'utiliser directement
        if (data instanceof FormData) {
            return this.request(`/apprenants/${id}`, {
                method: 'PUT',
                body: data
            });
        }
        
        // Sinon, créer un FormData à partir de l'objet
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        
        return this.request(`/apprenants/${id}`, {
            method: 'PUT',
            body: formData
        });
    }

    async deleteApprenant(id) {
        return this.request(`/apprenants/${id}`, {
            method: 'DELETE'
        });
    }
    async getApprenantStats() {
        return this.request('/apprenants/stats/summary');
    }
    
    // Apprenants - Inscription à une formation
    async inscrireApprenant(apprenantId, formationId) {
        return this.request(`/apprenants/${apprenantId}/inscrire`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ formationId })
        });
    }

    // Inscriptions - RESTE EN JSON (pas de fichiers)
    async getInscriptions() {
        return this.request('/inscriptions');
    }

    async getInscription(id) {
        return this.request(`/inscriptions/${id}`);
    }

    async createInscription(data) {
        return this.request('/inscriptions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateInscription(id, data) {
        return this.request(`/inscriptions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteInscription(id) {
        return this.request(`/inscriptions/${id}`, {
            method: 'DELETE'
        });
    }
}

const api = new ApiService();