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

        // Only set Content-Type to application/json if body is not FormData
        if (!(options.body instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Formations
    async getFormations() {
        return this.request('/formations');
    }

    async getFormation(id) {
        return this.request(`/formations/${id}`);
    }

    async createFormation(data) {
        return this.request('/formations', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateFormation(id, data) {
        return this.request(`/formations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteFormation(id) {
        return this.request(`/formations/${id}`, {
            method: 'DELETE'
        });
    }

    // Formateurs
    async getFormateurs() {
        return this.request('/formateurs');
    }

    async getFormateur(id) {
        return this.request(`/formateurs/${id}`);
    }

    async createFormateur(data) {
        // Si data est déjà un FormData, l'utiliser directement
        const formData = data instanceof FormData ? data : new FormData();
        
        if (!(data instanceof FormData)) {
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
        }
        
        return this.request('/formateurs', {
            method: 'POST',
            body: formData
        });
    }

    async updateFormateur(id, data) {
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

    // Apprenants
    async getApprenants() {
        return this.request('/apprenants');
    }

    async getApprenant(id) {
        return this.request(`/apprenants/${id}`);
    }

    async createApprenant(data) {
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

    // Inscriptions
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

    async deleteInscription(id) {
        return this.request(`/inscriptions/${id}`, {
            method: 'DELETE'
        });
    }
}

const api = new ApiService();
