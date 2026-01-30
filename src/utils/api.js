const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
const STORAGE_KEY = 'ims_api_key';

export const api = {
    // Check if user is logged in (has key)
    isLoggedIn: () => {
        return !!localStorage.getItem(STORAGE_KEY);
    },

    // Login (Save key)
    // Note: We don't verify online here to allow offline/local dev flow, 
    // but the first actual request will fail if key determines it.
    // Or we can verify with a 'ping' action if desired.
    login: (key) => {
        if (!key) return false;
        localStorage.setItem(STORAGE_KEY, key);
        return true;
    },

    // Logout
    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        // FORCE RELOAD to clear states
        window.location.reload();
    },

    // Get Data (GET request wrapper)
    // We append apiKey to query string for GET
    fetchData: async () => {
        const key = localStorage.getItem(STORAGE_KEY);
        if (!key) throw new Error('Unauthorized');

        try {
            // Append apiKey to URL
            const url = new URL(GAS_URL);
            url.searchParams.append('apiKey', key);

            const response = await fetch(url.toString());
            const data = await response.json();

            if (data.status === 'error' && data.message === 'Invalid API Key') {
                throw new Error('Invalid API Key');
            }
            return data;
        } catch (error) {
            console.error('API Fetch Error:', error);
            throw error;
        }
    },

    // Post Action (POST request wrapper)
    // We add apiKey to the JSON body
    post: async (action, payload = {}) => {
        const key = localStorage.getItem(STORAGE_KEY);
        if (!key) throw new Error('Unauthorized');

        const body = {
            action,
            apiKey: key,
            ...payload
        };

        try {
            const response = await fetch(GAS_URL, {
                method: 'POST',
                body: JSON.stringify(body)
            });
            const data = await response.json();

            if (data.status === 'error' && data.message === 'Invalid API Key') {
                throw new Error('Invalid API Key');
            }
            return data;
        } catch (error) {
            console.error('API Post Error:', error);
            throw error;
        }
    }
};
